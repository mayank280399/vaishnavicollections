import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://vaishnavicollections.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("slug, updated_at")
      .eq("visibility", "PUBLISHED")
      .eq("online_enabled", true),
    supabase
      .from("product_categories")
      .select("id, slug, parent_id, updated_at")
      .eq("category_type", "PRODUCT")
      .eq("active", true),
  ]);

  const categoryById = new Map(
    (categories ?? []).map((category) => [category.id, category]),
  );
  const staticRoutes = [
    "/",
    "/products",
    "/about",
    "/contact",
    "/handmade",
    "/shipping-policy",
    "/refund-returns",
    "/privacy-policy",
    "/terms",
  ];

  return [
    ...staticRoutes.map((route) => ({ url: `${SITE_URL}${route}` })),
    ...(categories ?? []).flatMap((category) => {
      const parent = category.parent_id ? categoryById.get(category.parent_id) : null;
      const route = parent
        ? `/collections/${parent.slug}/${category.slug}`
        : `/collections/${category.slug}`;
      return [
        {
          url: `${SITE_URL}${route}`,
          ...(category.updated_at ? { lastModified: category.updated_at } : {}),
        },
      ];
    }),
    ...(products ?? []).map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      ...(product.updated_at ? { lastModified: product.updated_at } : {}),
    })),
  ];
}
