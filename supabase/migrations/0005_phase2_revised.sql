-- Grit Markets Phase 2 (REVISED): licensing decoupled from billing.
-- Licenses can now be issued manually (trial cohort) or by Stripe (final
-- milestone). Adds the onboarding state machine and the risk-profile
-- lookup that backs the abstracted Strategy Settings UI.
-- Idempotent: safe to re-run.

-- ------------------------------------------------------------- profiles
-- Owner role gates /admin. Assigned manually in the SQL editor:
--   update public.profiles set role = 'owner' where email = 'you@...';
alter table public.profiles
  add column if not exists role text not null default 'customer';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('customer', 'owner'));
  end if;
end $$;

-- ------------------------------------------------------------- licenses
-- Manual licenses have no subscription; they validate on expires_at instead.
alter table public.licenses
  alter column subscription_id drop not null;

alter table public.licenses
  add column if not exists source text not null default 'stripe',
  add column if not exists expires_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'licenses_source_check'
  ) then
    alter table public.licenses
      add constraint licenses_source_check check (source in ('manual', 'stripe'));
  end if;
end $$;

-- --------------------------------------------------------- license_events
-- Admin actions are audited in the same stream as validation traffic.
alter table public.license_events drop constraint if exists license_events_event_check;
alter table public.license_events
  add constraint license_events_event_check
  check (event in (
    'validated', 'rejected', 'rebound', 'telemetry',
    'issued', 'extended', 'revoked', 'welcome_resent'
  ));

-- -------------------------------------------------------- onboarding_state
-- Current state per user, derived ONLY from server-observed signals
-- (never self-reported). One row per user; entered_at tracks the last
-- transition. History lives in license_events + telemetry timestamps.
create table if not exists public.onboarding_state (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  state text not null default 'created' check (state in (
    'created', 'license_issued', 'downloaded', 'validated',
    'telemetry_live', 'demo_bound', 'live_bound', 'healthy',
    'stalled_validation', 'stalled_telemetry'
  )),
  entered_at timestamptz not null default now()
);
alter table public.onboarding_state enable row level security;
drop policy if exists "onboarding_state: own read" on public.onboarding_state;
create policy "onboarding_state: own read" on public.onboarding_state
  for select using (auth.uid () = user_id);
-- writes: service role only (no insert/update policies)

-- ------------------------------------------------------------ risk_profiles
-- The IP-protection pivot: raw strategy parameters live server-side only.
-- Customers pick a profile; the server maps it to raw params and queues
-- them through the existing settings-sync channel. Raw values are never
-- rendered client-side and never exposed as EA inputs.
create table if not exists public.risk_profiles (
  key text primary key,
  label text not null,
  description text not null,
  params jsonb not null,
  sort int not null default 0
);
alter table public.risk_profiles enable row level security;
drop policy if exists "risk_profiles: authenticated read label" on public.risk_profiles;
-- Authenticated users may read label/description/sort via a view; the raw
-- params column must NOT be exposed. No select policy on the table itself:
-- service role reads params server-side, customers read the safe view below.

create or replace view public.risk_profiles_public
  with (security_invoker = off) as
  select key, label, description, sort from public.risk_profiles;
grant select on public.risk_profiles_public to authenticated;

-- Placeholder presets calibrated from the engine's shipped configuration.
-- [OWNER INPUT pending: final raw params per profile before external trials.]
insert into public.risk_profiles (key, label, description, params, sort) values
  ('conservative', 'Conservative',
   'Shallower recovery ladder, tighter equity stop, widest spacing. Slowest sizing growth of the three profiles.',
   '{"base_lot":0.01,"lot_multiplier":1.15,"max_legs":15,"take_profit_points":34,"grid_step_points":26,"use_equity_stop":true,"equity_stop_pct":15,"news_filter":true}',
   1),
  ('balanced', 'Balanced',
   'The engine''s shipped configuration: the default ladder and the default equity stop.',
   '{"base_lot":0.01,"lot_multiplier":1.21,"max_legs":21,"take_profit_points":34,"grid_step_points":21,"use_equity_stop":true,"equity_stop_pct":20,"news_filter":true}',
   2),
  ('aggressive', 'Aggressive',
   'Deeper ladder with tighter spacing and a looser equity stop. Materially higher drawdown risk — read the risk guide first.',
   '{"base_lot":0.01,"lot_multiplier":1.21,"max_legs":26,"take_profit_points":34,"grid_step_points":18,"use_equity_stop":true,"equity_stop_pct":25,"news_filter":true}',
   3)
on conflict (key) do update
  set label = excluded.label,
      description = excluded.description,
      params = excluded.params,
      sort = excluded.sort;

-- -------------------------------------------------------- strategy_settings
-- Track which profile a settings version came from (nullable: custom/legacy).
alter table public.strategy_settings
  add column if not exists risk_profile text references public.risk_profiles (key);

-- IP protection: customers may read their settings' status/version/profile
-- but never the raw params column. Column-level grant replaces the blanket
-- table grant (RLS row policies still apply on top).
revoke select on public.strategy_settings from authenticated, anon;
grant select (id, account_link_id, version, status, created_at, applied_at,
              applied_by, previous_version, risk_profile)
  on public.strategy_settings to authenticated;

-- ------------------------------------------------------------ downloads note
-- The downloads table (0001) is the server-observed signal for the
-- 'downloaded' onboarding state; no schema change needed.
