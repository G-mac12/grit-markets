-- ============================================================================
-- Grit Markets — OWNER DEMO SEED
-- Populates YOUR account with realistic demo data so the /account dashboard
-- renders fully (equity curve, trades, analytics, safety buffer, alerts)
-- WITHOUT Stripe or a live EA. Safe to re-run (idempotent).
--
-- HOW TO USE
--   1. Make sure the site is deployed with the Supabase env vars, then sign
--      in once at https://gritmarkets.com/login (this creates your profile).
--   2. Edit the email on the line marked >>> EDIT ME <<< below.
--   3. Paste this whole file into Supabase SQL Editor and Run.
--   4. Refresh https://gritmarkets.com/account — the dashboard is populated.
--
-- TO REMOVE THE DEMO DATA LATER: run the cleanup block at the bottom.
-- ============================================================================

do $$
declare
  v_user_id uuid;
  v_sub_id uuid;
  v_license_id uuid;
  v_link_id uuid;
  v_ts timestamptz;
  v_eq numeric := 10000;
  v_bal numeric := 10000;
  v_day date;
  v_i int;
  v_profit numeric;
  v_level int;
  v_open boolean;
  v_day_pl numeric;
  v_wins int;
  v_closed int;
begin
  -- ---------------------------------------------------------- find the user
  select id into v_user_id from public.profiles
  where email = 'grant.macmillan1@gmail.com';   -- >>> EDIT ME <<<
  if v_user_id is null then
    raise exception 'No profile found for that email. Sign in once at gritmarkets.com/login first, then edit the email in this script.';
  end if;

  -- ------------------------------------------------- subscription (no Stripe)
  insert into public.subscriptions
    (user_id, stripe_customer_id, stripe_subscription_id, tier, status, current_period_end)
  values
    (v_user_id, 'cus_DEMO', 'sub_DEMO', 'pro', 'active', now() + interval '30 days')
  on conflict (stripe_subscription_id) do update set status = 'active',
    current_period_end = now() + interval '30 days'
  returning id into v_sub_id;

  -- ------------------------------------------------------------------ license
  insert into public.licenses
    (user_id, subscription_id, license_key, status, max_accounts, mt5_account_numbers)
  values
    (v_user_id, v_sub_id, 'GM-DEMO2-DEMO3-DEMO4-DEMO5', 'active', 3, array['12345678'])
  on conflict (license_key) do update set status = 'active'
  returning id into v_license_id;

  -- --------------------------------------------------------------- account link
  insert into public.account_links
    (user_id, license_id, mt5_account, broker_label, account_currency, is_demo, status)
  values
    (v_user_id, v_license_id, '12345678', 'IC Markets Demo', 'USD', true, 'active')
  on conflict (license_id, mt5_account) do update set status = 'active'
  returning id into v_link_id;

  -- wipe previous demo telemetry so re-runs stay clean
  delete from public.telemetry_snapshots where account_link_id = v_link_id;
  delete from public.trades where account_link_id = v_link_id;
  delete from public.daily_summaries where account_link_id = v_link_id;

  -- --------------------------- 7 days of snapshots, one every 30 min (random walk)
  for v_i in 0..335 loop
    v_ts := now() - ((335 - v_i) * interval '30 minutes');
    v_eq := v_eq + (random() - 0.47) * 14;
    if v_i % 48 = 0 then v_bal := v_eq; end if;   -- balance steps at "day" edges
    v_open := random() < 0.4;
    insert into public.telemetry_snapshots
      (account_link_id, ts, balance, equity, margin, free_margin,
       margin_level_pct, open_positions_count, floating_pl)
    values
      (v_link_id, v_ts, round(v_bal, 2), round(v_eq, 2),
       case when v_open then 180 else 0 end,
       round(v_eq, 2) - case when v_open then 180 else 0 end,
       case when v_open then round((v_eq / 180) * 100) else null end,
       case when v_open then 1 + floor(random() * 3)::int else 0 end,
       round(v_eq - v_bal, 2));
  end loop;

  -- --------------------------------------- 60 closed trades over the last 14 days
  for v_i in 1..60 loop
    if random() < 0.82 then
      v_profit := round((2 + random() * 8)::numeric, 2);          -- frequent small wins
    else
      v_profit := -round((12 + random() * 55)::numeric, 2);       -- occasional deeper losses
    end if;
    v_level := case
      when random() < 0.60 then 1
      when random() < 0.80 then 2
      when random() < 0.93 then 3
      else 4 + floor(random() * 2)::int
    end;
    v_ts := now() - (random() * interval '14 days');
    insert into public.trades
      (account_link_id, mt5_ticket, symbol, direction, lots,
       open_time, close_time, open_price, close_price,
       profit, commission, swap, sequence_level)
    values
      (v_link_id, 100000 + v_i,
       (array['EURUSD','GBPUSD','EURUSD','EURUSD'])[1 + floor(random() * 4)::int],
       case when random() < 0.5 then 'buy' else 'sell' end,
       round((0.01 * power(2, v_level - 1))::numeric, 2),
       v_ts - interval '3 hours', v_ts,
       round((1.05 + random() * 0.05)::numeric, 5),
       round((1.05 + random() * 0.05)::numeric, 5),
       v_profit, -round((0.07 * v_level)::numeric, 2), 0, v_level)
    on conflict (account_link_id, mt5_ticket) do nothing;
  end loop;

  -- ------------------------------------------------ daily summaries (14 days)
  for v_i in 1..14 loop
    v_day := (now() - (v_i * interval '1 day'))::date;
    select coalesce(sum(profit + commission + swap), 0), count(*),
           count(*) filter (where profit > 0)
      into v_day_pl, v_closed, v_wins
      from public.trades
     where account_link_id = v_link_id and close_time::date = v_day;
    insert into public.daily_summaries
      (account_link_id, date, starting_balance, ending_balance, realized_pl,
       floating_pl_eod, max_drawdown_pct, max_margin_used_pct,
       trades_closed, win_count, skim_recommended)
    values
      (v_link_id, v_day, 10000, 10000 + v_day_pl, v_day_pl,
       round((random() * -20)::numeric, 2),
       round((1 + random() * 7)::numeric, 2),
       round((5 + random() * 25)::numeric, 2),
       v_closed, v_wins, null)
    on conflict (account_link_id, date) do nothing;
  end loop;

  -- ------------------------------------- safety-buffer rule + a live recommendation
  insert into public.skim_rules
    (account_link_id, trigger, threshold_value, skim_pct, enabled)
  select v_link_id, 'realized_profit_amount', 20, 50, true
  where not exists (select 1 from public.skim_rules where account_link_id = v_link_id);

  insert into public.skim_ledger
    (account_link_id, recommended_amount, status, note)
  select v_link_id, 18.50, 'recommended', 'rule:realized_profit_amount (demo)'
  where not exists (select 1 from public.skim_ledger where account_link_id = v_link_id);

  -- ------------------------------------------------------------- alert defaults
  insert into public.alert_rules (account_link_id, type, threshold, enabled)
  values
    (v_link_id, 'margin_level', 300, true),
    (v_link_id, 'drawdown', 10, true),
    (v_link_id, 'ea_offline', null, true)
  on conflict (account_link_id, type) do nothing;

  raise notice 'Demo data seeded for %', v_user_id;
end $$;

-- ============================================================================
-- CLEANUP (run this block alone when you want the demo data gone)
-- ============================================================================
-- do $$
-- declare v_license_id uuid;
-- begin
--   select id into v_license_id from public.licenses
--    where license_key = 'GM-DEMO2-DEMO3-DEMO4-DEMO5';
--   if v_license_id is not null then
--     delete from public.account_links where license_id = v_license_id; -- cascades
--     delete from public.licenses where id = v_license_id;
--   end if;
--   delete from public.subscriptions where stripe_subscription_id = 'sub_DEMO';
-- end $$;
