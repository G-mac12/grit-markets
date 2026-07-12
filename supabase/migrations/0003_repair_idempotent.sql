-- Grit Markets — REPAIR MIGRATION
-- Fully idempotent version of 0002: creates anything missing, skips anything
-- that already exists, never drops data. Run this when 0002 partially
-- applied (e.g. "relation already exists" errors). Safe to run repeatedly.

-- ------------------------------------------------------------- profiles
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists totp_enabled boolean not null default false,
  add column if not exists deletion_requested_at timestamptz;

-- ------------------------------------------------------------- licenses
alter table public.licenses
  add column if not exists telemetry_secret_enc text;

-- --------------------------------------------------------- account_links
create table if not exists public.account_links (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  license_id uuid not null references public.licenses (id) on delete cascade,
  mt5_account text not null,
  broker_label text,
  account_currency text not null default 'USD',
  is_demo boolean not null default true,
  status text not null default 'active' check (status in ('active', 'unlinked')),
  linked_at timestamptz not null default now(),
  unique (license_id, mt5_account)
);
create index if not exists account_links_user_idx on public.account_links (user_id);
alter table public.account_links enable row level security;
drop policy if exists "account_links: own read" on public.account_links;
create policy "account_links: own read" on public.account_links
  for select using (auth.uid () = user_id);

-- ----------------------------------------------------- telemetry_snapshots
create table if not exists public.telemetry_snapshots (
  id bigint generated always as identity primary key,
  account_link_id uuid not null references public.account_links (id) on delete cascade,
  ts timestamptz not null default now(),
  balance numeric not null,
  equity numeric not null,
  margin numeric not null default 0,
  free_margin numeric not null default 0,
  margin_level_pct numeric,
  open_positions_count int not null default 0,
  floating_pl numeric not null default 0
);
create index if not exists telemetry_snapshots_acct_ts_idx
  on public.telemetry_snapshots (account_link_id, ts desc);
alter table public.telemetry_snapshots enable row level security;
drop policy if exists "telemetry: own read" on public.telemetry_snapshots;
create policy "telemetry: own read" on public.telemetry_snapshots
  for select using (
    exists (select 1 from public.account_links al
            where al.id = account_link_id and al.user_id = auth.uid ())
  );

-- ------------------------------------------------------------------ trades
create table if not exists public.trades (
  id bigint generated always as identity primary key,
  account_link_id uuid not null references public.account_links (id) on delete cascade,
  mt5_ticket bigint not null,
  symbol text not null,
  direction text not null check (direction in ('buy', 'sell')),
  lots numeric not null,
  open_time timestamptz,
  close_time timestamptz,
  open_price numeric,
  close_price numeric,
  profit numeric not null default 0,
  commission numeric not null default 0,
  swap numeric not null default 0,
  sequence_level int,
  unique (account_link_id, mt5_ticket)
);
create index if not exists trades_acct_close_idx on public.trades (account_link_id, close_time desc);
alter table public.trades enable row level security;
drop policy if exists "trades: own read" on public.trades;
create policy "trades: own read" on public.trades
  for select using (
    exists (select 1 from public.account_links al
            where al.id = account_link_id and al.user_id = auth.uid ())
  );

-- --------------------------------------------------------- daily_summaries
create table if not exists public.daily_summaries (
  id bigint generated always as identity primary key,
  account_link_id uuid not null references public.account_links (id) on delete cascade,
  date date not null,
  starting_balance numeric,
  ending_balance numeric,
  realized_pl numeric not null default 0,
  floating_pl_eod numeric not null default 0,
  max_drawdown_pct numeric,
  max_margin_used_pct numeric,
  trades_closed int not null default 0,
  win_count int not null default 0,
  skim_recommended numeric,
  unique (account_link_id, date)
);
alter table public.daily_summaries enable row level security;
drop policy if exists "daily_summaries: own read" on public.daily_summaries;
create policy "daily_summaries: own read" on public.daily_summaries
  for select using (
    exists (select 1 from public.account_links al
            where al.id = account_link_id and al.user_id = auth.uid ())
  );

-- -------------------------------------------------------------- skim_rules
create table if not exists public.skim_rules (
  id uuid primary key default gen_random_uuid (),
  account_link_id uuid not null references public.account_links (id) on delete cascade,
  trigger text not null check (trigger in ('equity_above_hwm_pct', 'realized_profit_amount', 'weekly')),
  threshold_value numeric not null,
  skim_pct numeric not null check (skim_pct > 0 and skim_pct <= 100),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.skim_rules enable row level security;
drop policy if exists "skim_rules: own all" on public.skim_rules;
create policy "skim_rules: own all" on public.skim_rules
  for all using (
    exists (select 1 from public.account_links al
            where al.id = account_link_id and al.user_id = auth.uid ())
  );

-- ------------------------------------------------------------- skim_ledger
create table if not exists public.skim_ledger (
  id uuid primary key default gen_random_uuid (),
  account_link_id uuid not null references public.account_links (id) on delete cascade,
  created_at timestamptz not null default now(),
  recommended_amount numeric not null,
  status text not null default 'recommended'
    check (status in ('recommended', 'confirmed', 'dismissed')),
  confirmed_amount numeric,
  confirmed_at timestamptz,
  note text
);
create index if not exists skim_ledger_acct_idx on public.skim_ledger (account_link_id, created_at desc);
alter table public.skim_ledger enable row level security;
drop policy if exists "skim_ledger: own read" on public.skim_ledger;
create policy "skim_ledger: own read" on public.skim_ledger
  for select using (
    exists (select 1 from public.account_links al
            where al.id = account_link_id and al.user_id = auth.uid ())
  );

-- -------------------------------------------------------- strategy_settings
create table if not exists public.strategy_settings (
  id uuid primary key default gen_random_uuid (),
  account_link_id uuid not null references public.account_links (id) on delete cascade,
  version int not null,
  params jsonb not null,
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'applied', 'rejected')),
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  applied_by text not null default 'user',
  previous_version int,
  unique (account_link_id, version)
);
alter table public.strategy_settings enable row level security;
drop policy if exists "strategy_settings: own read" on public.strategy_settings;
create policy "strategy_settings: own read" on public.strategy_settings
  for select using (
    exists (select 1 from public.account_links al
            where al.id = account_link_id and al.user_id = auth.uid ())
  );

-- ---------------------------------------------------------- settings_audit
create table if not exists public.settings_audit (
  id bigint generated always as identity primary key,
  account_link_id uuid not null references public.account_links (id) on delete cascade,
  actor_user_id uuid not null,
  change jsonb not null,
  ip text,
  created_at timestamptz not null default now()
);
alter table public.settings_audit enable row level security;
drop policy if exists "settings_audit: own read" on public.settings_audit;
create policy "settings_audit: own read" on public.settings_audit
  for select using (
    exists (select 1 from public.account_links al
            where al.id = account_link_id and al.user_id = auth.uid ())
  );

-- ------------------------------------------------------------- alert_rules
create table if not exists public.alert_rules (
  id uuid primary key default gen_random_uuid (),
  account_link_id uuid not null references public.account_links (id) on delete cascade,
  type text not null check (type in ('margin_level', 'drawdown', 'ea_offline')),
  threshold numeric,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (account_link_id, type)
);
alter table public.alert_rules enable row level security;
drop policy if exists "alert_rules: own all" on public.alert_rules;
create policy "alert_rules: own all" on public.alert_rules
  for all using (
    exists (select 1 from public.account_links al
            where al.id = account_link_id and al.user_id = auth.uid ())
  );

-- ------------------------------------------------------------ alert_events
create table if not exists public.alert_events (
  id bigint generated always as identity primary key,
  alert_rule_id uuid not null references public.alert_rules (id) on delete cascade,
  fired_at timestamptz not null default now(),
  value numeric,
  notified_at timestamptz
);
alter table public.alert_events enable row level security;
drop policy if exists "alert_events: own read" on public.alert_events;
create policy "alert_events: own read" on public.alert_events
  for select using (
    exists (select 1 from public.alert_rules ar
            join public.account_links al on al.id = ar.account_link_id
            where ar.id = alert_rule_id and al.user_id = auth.uid ())
  );

-- ------------------------------------------------------- email_preferences
create table if not exists public.email_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  daily_digest boolean not null default true,
  weekly_newsletter boolean not null default false,
  alert_emails boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.email_preferences enable row level security;
drop policy if exists "email_preferences: own all" on public.email_preferences;
create policy "email_preferences: own all" on public.email_preferences
  for all using (auth.uid () = user_id);

-- ---------------------------------------- license_events: allow 'telemetry'
alter table public.license_events drop constraint if exists license_events_event_check;
alter table public.license_events
  add constraint license_events_event_check
  check (event in ('validated', 'rejected', 'rebound', 'telemetry'));
