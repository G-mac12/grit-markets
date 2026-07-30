-- Grit Markets: server-distributed no-trade schedule.
-- The 16.5-year stop-out study produces a tiered calendar (RED/AMBER/WATCH
-- date tiers, weekly windows, ISO-week overlays). The platform is the
-- single source of truth: the owner uploads a new version in /admin and
-- every licensed EA picks it up automatically — customers never handle
-- files. Idempotent.

create table if not exists public.schedule_versions (
  id uuid primary key default gen_random_uuid (),
  version int not null unique,
  csv text not null,
  sha256 text not null,
  notes text,
  active boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.schedule_versions enable row level security;
-- no policies: service role only. EAs fetch via /api/schedule with a
-- validated licence key; the CSV never needs client-side DB access.

create index if not exists schedule_versions_active_idx
  on public.schedule_versions (active) where active;
