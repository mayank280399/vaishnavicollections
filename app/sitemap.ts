import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { buildSitemapEntries } from "@/lib/sitemap-utils";

const SITE_URL = "https://vaishnavicollections.vercel.app";
const PAGE_SIZE = 1000;

async function fetchAll<T>(query: {
  range: (
    from: number,
    to: number,
  ) => PromiseLike<{
    data: T[] | null;
    error: { message: string } | null;
  }>;
}): Promise<T[]> {
  const rows: T[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await query.range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [products, categories] = await Promise.all([
    fetchAll<{ id: string; slug: string; category_id: string | null; updated_at: string | null; visibility: string; online_enabled: boolean }>(supabase
      .from("products")
      .select("id, slug, category_id, updated_at, visibility, online_enabled")
      .eq("visibility", "PUBLISHED")
      .eq("online_enabled", true)),
    fetchAll<{ id: string; slug: string; parent_id: string | null; updated_at: string | null; category_type: string; active: boolean; show_subcategory: boolean }>(supabase
      .from("product_categories")
      .select("id, slug, parent_id, updated_at, category_type, active, show_subcategory")
      .eq("category_type", "PRODUCT")
      .eq("active", true)),
  ]);

  const imageProductIds = products.map((product) => product.id);
  const imageRows = await Promise.all(
    Array.from({ length: Math.ceil(imageProductIds.length / 500) }, (_, index) => {
      const ids = imageProductIds.slice(index * 500, (index + 1) * 500);
      return fetchAll<{ product_id: string; image_url: string | null }>(
        supabase.from("product_images").select("product_id, image_url").in("product_id", ids),
      );
    }),
  );
  const productsWithImages = new Set(
    imageRows.flat().filter((image) => Boolean(image.image_url?.trim())).map((image) => image.product_id),
  );

  return buildSitemapEntries({
    siteUrl: SITE_URL,
    categories,
    products: products.map((product) => ({ ...product, hasPublicImage: productsWithImages.has(product.id) })),
  });
}
