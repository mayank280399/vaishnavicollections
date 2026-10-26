-- Promotion/coupon configuration managed through authenticated admin server actions.
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  description text,
  discount_type text not null default 'FIXED'
    check (discount_type in ('FIXED', 'PERCENTAGE')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  minimum_order_amount numeric(12,2) not null default 0 check (minimum_order_amount >= 0),
  maximum_discount_amount numeric(12,2),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  per_customer_limit integer not null default 1 check (per_customer_limit > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default false,
  first_order_only boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotions_code_uppercase check (code = upper(code)),
  constraint promotions_dates_valid check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint promotions_max_discount_valid check (maximum_discount_amount is null or maximum_discount_amount > 0)
);

create unique index if not exists promotions_code_unique on public.promotions (code);
create index if not exists promotions_active_dates_idx on public.promotions (active, starts_at, ends_at);

alter table public.promotions enable row level security;

-- No direct client reads/writes. Server actions perform explicit role checks and use the service client.
drop policy if exists "promotions_no_direct_client_access" on public.promotions;
create policy "promotions_no_direct_client_access"
  on public.promotions for all to anon, authenticated
  using (false) with check (false);
