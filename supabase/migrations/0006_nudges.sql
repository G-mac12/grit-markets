-- Grit Markets: onboarding nudge dedupe. Max one nudge email per state —
-- the cron records which stalled state it last nudged for.
alter table public.onboarding_state
  add column if not exists last_nudged_state text;
