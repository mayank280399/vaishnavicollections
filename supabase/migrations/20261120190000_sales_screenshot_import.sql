create table if not exists public.sales_image_imports (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  image_path text not null,
  content_hash text not null unique,
  status text not null default 'REVIEW'
    check (status in ('REVIEW', 'IMPORTED', 'FAILED')),
  extracted_rows jsonb not null default '[]'::jsonb,
  imported_count integer not null default 0,
  imported_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  imported_at timestamptz
);

create index if not exists sales_image_imports_uploaded_by_created_at_idx
  on public.sales_image_imports (uploaded_by, created_at desc);

alter table public.sales_image_imports enable row level security;

drop policy if exists "Sales import admins can read own imports" on public.sales_image_imports;
create policy "Sales import admins can read own imports"
  on public.sales_image_imports for select to authenticated
  using (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and upper(coalesce(p.role, '')) in ('ADMIN', 'OWNER', 'STAFF')
    )
  );

drop policy if exists "Sales import admins can create imports" on public.sales_image_imports;
create policy "Sales import admins can create imports"
  on public.sales_image_imports for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and upper(coalesce(p.role, '')) in ('ADMIN', 'OWNER', 'STAFF')
    )
  );

drop policy if exists "Sales import admins can update own imports" on public.sales_image_imports;
create policy "Sales import admins can update own imports"
  on public.sales_image_imports for update to authenticated
  using (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and upper(coalesce(p.role, '')) in ('ADMIN', 'OWNER', 'STAFF')
    )
  )
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and upper(coalesce(p.role, '')) in ('ADMIN', 'OWNER', 'STAFF')
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sales-imports', 'sales-imports', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Sales import admins can upload screenshots" on storage.objects;
create policy "Sales import admins can upload screenshots"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'sales-imports'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and upper(coalesce(p.role, '')) in ('ADMIN', 'OWNER', 'STAFF')
    )
  );

drop policy if exists "Sales import admins can read screenshots" on storage.objects;
create policy "Sales import admins can read screenshots"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'sales-imports'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and upper(coalesce(p.role, '')) in ('ADMIN', 'OWNER', 'STAFF')
    )
  );

create or replace function public.import_sales_image_rows(
  p_import_id uuid,
  p_customer_id uuid,
  p_rows jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_import public.sales_image_imports%rowtype;
  v_row jsonb;
  v_product_id uuid;
  v_sale_date date;
  v_quantity numeric(12,3);
  v_amount numeric(12,2);
  v_payment_method text;
  v_count integer := 0;
  v_total numeric(12,2) := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and upper(coalesce(p.role, '')) in ('ADMIN', 'OWNER', 'STAFF')
  ) then
    raise exception 'You are not allowed to import sales.';
  end if;

  select * into v_import
  from public.sales_image_imports
  where id = p_import_id
    and uploaded_by = auth.uid()
  for update;

  if not found then
    raise exception 'Sales import was not found.';
  end if;

  if v_import.status <> 'REVIEW' then
    raise exception 'This screenshot has already been imported or is not ready.';
  end if;

  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'Add at least one valid sales entry.';
  end if;

  if not exists (select 1 from public.customers where id = p_customer_id) then
    raise exception 'Anonymous / walk-in customer record was not found.';
  end if;

  for v_row in select value from jsonb_array_elements(p_rows)
  loop
    v_product_id := nullif(v_row->>'product_id', '')::uuid;
    v_sale_date := (v_row->>'date')::date;
    v_quantity := (v_row->>'quantity')::numeric;
    v_amount := (v_row->>'amount')::numeric;
    v_payment_method := upper(coalesce(v_row->>'payment_method', ''));

    if v_product_id is null
      or v_quantity is null or v_quantity <= 0
      or v_amount is null or v_amount < 0
      or v_sale_date is null then
      raise exception 'One or more entries contain invalid date, product, quantity or amount.';
    end if;

    if v_payment_method not in ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER') then
      raise exception 'Unsupported payment method: %', v_payment_method;
    end if;

    if not exists (
      select 1 from public.products
      where id = v_product_id
        and coalesce(visibility, '') <> 'ARCHIVED'
    ) then
      raise exception 'A selected product no longer exists or is archived.';
    end if;

    -- Screenshot Amount is treated as the full line amount. The existing
    -- create_sale routine receives a per-unit selling price.
    perform public.create_sale(
      p_customer_id => p_customer_id,
      p_product_id => v_product_id,
      p_variant_id => null,
      p_quantity => v_quantity,
      p_unit_price => round(v_amount / v_quantity, 2),
      p_discount => 0,
      p_payment_method => v_payment_method,
      p_purchased_at => ((v_sale_date + time '12:00') at time zone 'Asia/Kolkata')
    );

    v_count := v_count + 1;
    v_total := v_total + v_amount;
  end loop;

  update public.sales_image_imports
  set status = 'IMPORTED',
      extracted_rows = p_rows,
      imported_count = v_count,
      imported_total = v_total,
      imported_at = now()
  where id = p_import_id;

  return jsonb_build_object(
    'imported_count', v_count,
    'imported_total', v_total,
    'status', 'IMPORTED'
  );
end;
$$;

grant execute on function public.import_sales_image_rows(uuid, uuid, jsonb) to authenticated;
