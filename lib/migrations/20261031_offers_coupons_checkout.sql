-- Offers, coupons and payment-safe redemption accounting.
alter table public.promotions
  add column if not exists promotion_kind text not null default 'COUPON',
  add column if not exists updated_at timestamptz not null default now();

alter table public.promotions drop constraint if exists promotions_kind_check;
alter table public.promotions add constraint promotions_kind_check
  check (promotion_kind in ('COUPON','AUTOMATIC'));

alter table public.razorpay_checkout_intents
  add column if not exists subtotal_amount numeric(12,2) not null default 0,
  add column if not exists discount_amount numeric(12,2) not null default 0,
  add column if not exists promotion_id uuid references public.promotions(id) on delete set null,
  add column if not exists promotion_code text,
  add column if not exists promotion_name text;

alter table public.orders
  add column if not exists subtotal_amount numeric(12,2),
  add column if not exists discount_amount numeric(12,2) not null default 0,
  add column if not exists promotion_id uuid references public.promotions(id) on delete set null,
  add column if not exists promotion_code text,
  add column if not exists promotion_name text;

create table if not exists public.promotion_redemptions (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  order_id uuid not null unique references public.orders(id) on delete restrict,
  coupon_code text,
  subtotal_amount numeric(12,2) not null check (subtotal_amount >= 0),
  discount_amount numeric(12,2) not null check (discount_amount > 0),
  created_at timestamptz not null default now()
);
create index if not exists promotion_redemptions_promotion_idx
  on public.promotion_redemptions(promotion_id, created_at);
create index if not exists promotion_redemptions_customer_idx
  on public.promotion_redemptions(promotion_id, user_id);

alter table public.promotion_redemptions enable row level security;
drop policy if exists promotion_redemptions_no_direct_client_access on public.promotion_redemptions;
create policy promotion_redemptions_no_direct_client_access
  on public.promotion_redemptions for all to anon, authenticated
  using (false) with check (false);

-- Called only by the authenticated server route after Razorpay confirms capture.
-- The row lock serializes competing redemptions and enforces usage limits.
create or replace function public.finalize_online_order_promotion(
  p_order_id uuid,
  p_user_id uuid,
  p_subtotal_amount numeric,
  p_discount_amount numeric,
  p_promotion_id uuid default null,
  p_promotion_code text default null,
  p_promotion_name text default null
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_promotion public.promotions%rowtype;
  v_total_uses integer;
  v_customer_uses integer;
  v_prior_orders integer;
  v_order_total numeric;
  v_final_total numeric;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to finalize promotion';
  end if;

  if p_subtotal_amount < 0 or p_discount_amount < 0
     or p_discount_amount > p_subtotal_amount then
    raise exception 'Invalid promotion totals';
  end if;

  select total_amount into v_order_total
    from public.orders
   where id = p_order_id and user_id = p_user_id
   for update;

  if not found then
    raise exception 'Order not found for this customer';
  end if;

  if abs(coalesce(v_order_total, 0) - p_subtotal_amount) > 0.02 then
    raise exception 'Order subtotal changed during checkout; payment requires manual review';
  end if;

  if p_promotion_id is not null then
    select * into v_promotion
      from public.promotions
     where id = p_promotion_id
     for update;

    if not found or not v_promotion.active
       or (v_promotion.starts_at is not null and v_promotion.starts_at > now())
       or (v_promotion.ends_at is not null and v_promotion.ends_at <= now()) then
      raise exception 'This offer is no longer active';
    end if;

    select count(*) into v_total_uses
      from public.promotion_redemptions
     where promotion_id = p_promotion_id;
    select count(*) into v_customer_uses
      from public.promotion_redemptions
     where promotion_id = p_promotion_id and user_id = p_user_id;

    if v_promotion.usage_limit is not null and v_total_uses >= v_promotion.usage_limit then
      raise exception 'This offer has reached its redemption limit';
    end if;
    if v_customer_uses >= v_promotion.per_customer_limit then
      raise exception 'You have already used this offer the maximum number of times';
    end if;

    if v_promotion.first_order_only then
      select count(*) into v_prior_orders
        from public.orders
       where user_id = p_user_id and id <> p_order_id
         and coalesce(status, '') <> 'CANCELLED';
      if v_prior_orders > 0 then
        raise exception 'This offer is available on your first order only';
      end if;
    end if;

    if p_subtotal_amount < v_promotion.minimum_order_amount then
      raise exception 'The order no longer meets this offer minimum';
    end if;
  elsif p_discount_amount <> 0 then
    raise exception 'A discount requires a valid promotion';
  end if;

  v_final_total := round(p_subtotal_amount - p_discount_amount, 2);
  if v_final_total < 1 then
    raise exception 'The final payable amount must be at least ₹1';
  end if;

  update public.orders
     set subtotal_amount = p_subtotal_amount,
         discount_amount = p_discount_amount,
         promotion_id = p_promotion_id,
         promotion_code = p_promotion_code,
         promotion_name = p_promotion_name,
         total_amount = v_final_total,
         amount_due = v_final_total,
         updated_at = now()
   where id = p_order_id and user_id = p_user_id;

  if p_promotion_id is not null and p_discount_amount > 0 then
    insert into public.promotion_redemptions(
      promotion_id, user_id, order_id, coupon_code, subtotal_amount, discount_amount
    ) values (
      p_promotion_id, p_user_id, p_order_id, p_promotion_code, p_subtotal_amount, p_discount_amount
    ) on conflict (order_id) do nothing;
  end if;

  return true;
end;
$$;

revoke all on function public.finalize_online_order_promotion(uuid,uuid,numeric,numeric,uuid,text,text) from public, anon, authenticated;
grant execute on function public.finalize_online_order_promotion(uuid,uuid,numeric,numeric,uuid,text,text) to service_role;
