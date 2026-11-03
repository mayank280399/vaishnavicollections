-- Seed the finalized launch coupons for Vaishnavi Collections.
-- Safe to rerun: existing promotions are updated by their unique coupon code.
-- AGAIN5 is intentionally excluded because it was discussed but not approved.

insert into public.promotions (
  code,
  name,
  description,
  promotion_kind,
  discount_type,
  discount_value,
  minimum_order_amount,
  maximum_discount_amount,
  usage_limit,
  per_customer_limit,
  starts_at,
  ends_at,
  first_order_only,
  active
)
values
  (
    'WELCOME50',
    'First Order Welcome Offer',
    'Get ₹50 off your first order of ₹599 or more.',
    'COUPON',
    'FIXED',
    50,
    599,
    null,
    null,
    1,
    null,
    null,
    true,
    true
  ),
  (
    'NEW10',
    'First Order 10% Off',
    'Get 10% off up to ₹75 on your first order of ₹799 or more.',
    'COUPON',
    'PERCENTAGE',
    10,
    799,
    75,
    null,
    1,
    null,
    null,
    true,
    true
  ),
  (
    'SAVE100',
    'Save ₹100',
    'Get ₹100 off orders of ₹999 or more.',
    'COUPON',
    'FIXED',
    100,
    999,
    null,
    null,
    1,
    null,
    null,
    false,
    true
  )
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  promotion_kind = excluded.promotion_kind,
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  minimum_order_amount = excluded.minimum_order_amount,
  maximum_discount_amount = excluded.maximum_discount_amount,
  usage_limit = excluded.usage_limit,
  per_customer_limit = excluded.per_customer_limit,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  first_order_only = excluded.first_order_only,
  active = excluded.active,
  updated_at = now();
