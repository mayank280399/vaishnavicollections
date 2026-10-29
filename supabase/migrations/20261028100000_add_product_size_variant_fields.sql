-- Add separate, optional product-level Size and Variant/Design labels.
-- Additive only: existing products, variants, and inventory are not modified.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS size text,
  ADD COLUMN IF NOT EXISTS variant_label text;

CREATE INDEX IF NOT EXISTS products_size_idx
  ON public.products (size)
  WHERE size IS NOT NULL AND btrim(size) <> '';

CREATE INDEX IF NOT EXISTS products_variant_label_idx
  ON public.products (variant_label)
  WHERE variant_label IS NOT NULL AND btrim(variant_label) <> '';
