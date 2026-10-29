-- Additive product unit / variant metadata for Vaishnavi Collections.
-- IMPORTANT: This migration intentionally does not UPDATE, DELETE, or backfill any
-- existing product, variant, purchase, sale, or stock records. New fields remain NULL
-- for historical rows until the user configures a product or records a new transaction.

alter table public.products
  add column if not exists base_unit_code text,
  add column if not exists base_unit_label text,
  add column if not exists unit_conversions jsonb;

alter table public.product_variants
  add column if not exists attributes jsonb;

alter table public.purchase_items
  add column if not exists entered_unit_code text,
  add column if not exists entered_unit_label text,
  add column if not exists entered_quantity numeric(14, 4),
  add column if not exists conversion_factor numeric(14, 6),
  add column if not exists base_quantity numeric(14, 4);

alter table public.sale_items
  add column if not exists entered_unit_code text,
  add column if not exists entered_unit_label text,
  add column if not exists entered_quantity numeric(14, 4),
  add column if not exists conversion_factor numeric(14, 6),
  add column if not exists base_quantity numeric(14, 4);

-- Validate only newly supplied conversion values; NULL is retained for all historical
-- rows and existing records are not rewritten.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_unit_conversions_is_array'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_unit_conversions_is_array
      check (unit_conversions is null or jsonb_typeof(unit_conversions) = 'array')
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'purchase_items_conversion_factor_positive'
      and conrelid = 'public.purchase_items'::regclass
  ) then
    alter table public.purchase_items
      add constraint purchase_items_conversion_factor_positive
      check (conversion_factor is null or conversion_factor > 0)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'sale_items_conversion_factor_positive'
      and conrelid = 'public.sale_items'::regclass
  ) then
    alter table public.sale_items
      add constraint sale_items_conversion_factor_positive
      check (conversion_factor is null or conversion_factor > 0)
      not valid;
  end if;
end $$;

comment on column public.products.base_unit_code is
  'Canonical inventory unit code for new/configured products, e.g. piece.';
comment on column public.products.base_unit_label is
  'Human-readable canonical inventory unit, e.g. Piece.';
comment on column public.products.unit_conversions is
  'Optional JSON array of configured purchase/sale units and positive conversion factors to the base unit. No historical rows are backfilled.';
comment on column public.product_variants.attributes is
  'Optional structured variant attributes, e.g. {"size":"2/4","color":"Red"}. Existing variant names and values remain untouched.';
comment on column public.purchase_items.entered_quantity is
  'Quantity as entered on the purchase line; NULL for historical records.';
comment on column public.purchase_items.conversion_factor is
  'Number of base units per entered unit; NULL for historical records.';
comment on column public.purchase_items.base_quantity is
  'Normalized inventory quantity in product base units; NULL for historical records.';
comment on column public.sale_items.entered_quantity is
  'Quantity as entered on the sale line; NULL for historical records.';
comment on column public.sale_items.conversion_factor is
  'Number of base units per entered unit; NULL for historical records.';
comment on column public.sale_items.base_quantity is
  'Normalized inventory quantity in product base units; NULL for historical records.';
