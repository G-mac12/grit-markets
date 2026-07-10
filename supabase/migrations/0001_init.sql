-- Grit Markets Phase 2 schema. Run against a NEW dedicated Supabase project.
-- RLS on everything; users read only their own rows; all writes happen via
-- the service role inside server routes.

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: own read" on public.profiles
  for select using (auth.uid () = id);

create policy "profiles: own update" on public.profiles
  for update using (auth.uid () = id);

-- auto-provision a profile row for every new auth user
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user ();

-- ------------------------------------------------------------ subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  tier text not null,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled')),
  current_period_end timestamptz,
  past_due_since timestamptz,
  created_at timestamptz not null default now()
);

create index subscriptions_user_idx on public.subscriptions (user_id);
create index subscriptions_customer_idx on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

create policy "subscriptions: own read" on public.subscriptions
  for select using (auth.uid () = user_id);

-- ---------------------------------------------------------------- licenses
create table public.licenses (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  license_key text not null unique,
  status text not null default 'active' check (status in ('active', 'suspended', 'revoked')),
  mt5_account_numbers text[] not null default '{}',
  max_accounts int not null default 1,
  last_validated_at timestamptz,
  created_at timestamptz not null default now()
);

create index licenses_user_idx on public.licenses (user_id);

alter table public.licenses enable row level security;

create policy "licenses: own read" on public.licenses
  for select using (auth.uid () = user_id);

-- ------------------------------------------------------------ license_events
create table public.license_events (
  id bigint generated always as identity primary key,
  license_id uuid not null references public.licenses (id) on delete cascade,
  event text not null check (event in ('validated', 'rejected', 'rebound')),
  mt5_account text,
  ip text,
  detail text,
  created_at timestamptz not null default now()
);

-- serves both the audit log and the per-key rate limiter
create index license_events_license_time_idx on public.license_events (license_id, created_at desc);

alter table public.license_events enable row level security;

create policy "license_events: own read" on public.license_events
  for select using (
    exists (
      select 1 from public.licenses l
      where l.id = license_id and l.user_id = auth.uid ()
    )
  );

-- ---------------------------------------------------------------- downloads
create table public.downloads (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  ea_version text not null,
  downloaded_at timestamptz not null default now()
);

create index downloads_user_idx on public.downloads (user_id);

alter table public.downloads enable row level security;

create policy "downloads: own read" on public.downloads
  for select using (auth.uid () = user_id);

-- ------------------------------------------------------------- stripe_events
-- processed Stripe event ids → idempotent webhook handling
create table public.stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
-- no policies: service-role only

-- -------------------------------------------------------------- storage note
-- Create a PRIVATE bucket named 'ea-builds' in Supabase Storage and upload
-- compiled EA files as '<version>/GritMarkets.ex5'. The dashboard issues
-- short-lived signed URLs; no public access.
