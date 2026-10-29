-- Add an optional SEO title for product detail pages.
-- Existing product records are preserved; blank values fall back to product_title/name.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS meta_title text;
