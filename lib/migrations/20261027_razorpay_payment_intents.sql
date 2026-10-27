-- Store checkout details temporarily before payment. The VC order is created only
-- after the corresponding Razorpay payment is verified as captured.
create table if not exists public.razorpay_checkout_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_order_id text not null unique,
  amount_paise bigint not null check (amount_paise >= 100),
  currency text not null default 'INR' check (currency = 'INR'),
  customer_name text not null,
  customer_phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  customer_notes text,
  save_customer_details boolean not null default false,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'PENDING' check (status in ('PENDING','PAID','ORDER_CREATED','CANCELLED')),
  order_id uuid references public.orders(id) on delete set null,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_razorpay_checkout_intents_user_created
  on public.razorpay_checkout_intents(user_id, created_at desc);

alter table public.razorpay_checkout_intents enable row level security;
-- No client policies: this table is accessed only by authenticated server routes
-- using the service-role client after validating the session.
