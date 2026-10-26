-- Award loyalty stamps for online orders only after a verified payment transition.
-- Idempotent per order: one ONLINE_ORDER transaction is the earning ledger entry.
-- Apply through the Supabase SQL editor before relying on automatic awards.

create unique index if not exists reward_transactions_online_order_once
  on public.reward_transactions (reference_type, reference_id)
  where reference_type = 'ONLINE_ORDER' and reference_id is not null;

create or replace function public.award_loyalty_stamps_for_paid_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_account_id uuid;
  v_spend_per_stamp numeric;
  v_eligible_spend numeric;
  v_stamps integer;
begin
  if new.payment_status is distinct from 'PAID'
     or old.payment_status is not distinct from 'PAID' then
    return new;
  end if;

  if new.user_id is null or coalesce(new.total_amount, 0) <= 0 then
    return new;
  end if;

  select c.id
    into v_customer_id
    from public.customers c
   where c.profile_id = new.user_id
   limit 1;

  if v_customer_id is null then
    -- A missing customer link should not break payment confirmation.
    raise notice 'Skipping loyalty award: no customer linked to paid order %', new.id;
    return new;
  end if;

  -- The unique ledger entry also makes the award safe across retries.
  if exists (
    select 1 from public.reward_transactions t
     where t.reference_type = 'ONLINE_ORDER'
       and t.reference_id = new.id
  ) then
    return new;
  end if;

  select greatest(coalesce(ls.spend_per_stamp, 500), 1)
    into v_spend_per_stamp
    from public.loyalty_settings ls
   order by ls.created_at nulls last
   limit 1;

  v_spend_per_stamp := coalesce(v_spend_per_stamp, 500);

  insert into public.reward_accounts (
    customer_id,
    points_balance,
    lifetime_points_earned,
    lifetime_points_redeemed,
    eligible_spend_balance
  )
  values (v_customer_id, 0, 0, 0, 0)
  on conflict (customer_id) do nothing;

  select ra.id, greatest(coalesce(ra.eligible_spend_balance, 0), 0)
    into v_account_id, v_eligible_spend
    from public.reward_accounts ra
   where ra.customer_id = v_customer_id
   for update;

  v_eligible_spend := v_eligible_spend + new.total_amount;
  v_stamps := floor(v_eligible_spend / v_spend_per_stamp)::integer;

  update public.reward_accounts
     set points_balance = coalesce(points_balance, 0) + v_stamps,
         lifetime_points_earned = coalesce(lifetime_points_earned, 0) + v_stamps,
         eligible_spend_balance = mod(v_eligible_spend, v_spend_per_stamp),
         updated_at = now()
   where id = v_account_id;

  insert into public.reward_transactions (
    reward_account_id,
    customer_id,
    type,
    amount,
    reference_type,
    reference_id,
    description
  )
  values (
    v_account_id,
    v_customer_id,
    'EARNED',
    v_stamps,
    'ONLINE_ORDER',
    new.id,
    case when v_stamps > 0
      then format('Loyalty stamps earned from online order %s', coalesce(new.order_number, new.id::text))
      else format('Eligible spend carried forward from online order %s', coalesce(new.order_number, new.id::text))
    end
  );

  return new;
end;
$$;

drop trigger if exists award_loyalty_stamps_after_online_payment on public.orders;

create trigger award_loyalty_stamps_after_online_payment
after update of payment_status on public.orders
for each row
when (new.payment_status = 'PAID' and old.payment_status is distinct from 'PAID')
execute function public.award_loyalty_stamps_for_paid_order();
