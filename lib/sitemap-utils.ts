import type { MetadataRoute } from "next";

type Category = {
  id: string;
  slug: string;
  parent_id: string | null;
  updated_at: string | null;
  category_type: string;
  active: boolean;
  show_subcategory: boolean;
};

type Product = {
  id: string;
  slug: string;
  category_id: string | null;
  updated_at: string | null;
  visibility: string;
  online_enabled: boolean;
  hasPublicImage: boolean;
};

const STATIC_ROUTES = [
  "/", "/products", "/about", "/contact", "/handmade",
  "/shipping-policy", "/refund-returns", "/privacy-policy", "/terms",
];

function usableSlug(value: string): boolean {
  return Boolean(
    value && value.trim() === value && value.length <= 200 &&
    value !== "." && value !== ".." && !/[\\/?#%\u0000-\u001f\u007f]/.test(value),
  );
}

function validLastModified(value: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function buildSitemapEntries({
  siteUrl,
  categories,
  products,
}: {
  siteUrl: string;
  categories: Category[];
  products: Product[];
}): MetadataRoute.Sitemap {
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  const add = (path: string, lastModified?: string | null) => {
    const url = `${siteUrl}${path}`;
    if (entries.has(url)) return;
    const modified = validLastModified(lastModified ?? null);
    entries.set(url, { url, ...(modified ? { lastModified: modified } : {}) });
  };

  STATIC_ROUTES.forEach((path) => add(path));

  const publicProducts = products.filter(
    (product) => product.visibility === "PUBLISHED" && product.online_enabled && usableSlug(product.slug),
  );
  const slugCounts = new Map<string, number>();
  publicProducts.forEach((product) => slugCounts.set(product.slug, (slugCounts.get(product.slug) ?? 0) + 1));
  const categoryProductIds = new Set(
    publicProducts.filter((product) => product.hasPublicImage).map((product) => product.category_id).filter((id): id is string => Boolean(id)),
  );

  const validCategories = categories.filter(
    (category) => category.category_type === "PRODUCT" && category.active && usableSlug(category.slug),
  );
  const roots = validCategories.filter((category) => category.parent_id === null);
  const rootIds = new Set(roots.map((category) => category.id));
  const children = validCategories.filter(
    (category) => category.parent_id !== null && rootIds.has(category.parent_id) && category.show_subcategory,
  );

  const rootSlugCounts = new Map<string, number>();
  roots.forEach((category) => rootSlugCounts.set(category.slug, (rootSlugCounts.get(category.slug) ?? 0) + 1));
  for (const root of roots) {
    if ((rootSlugCounts.get(root.slug) ?? 0) > 1) continue;
    const visibleChildren = children.filter((child) => child.parent_id === root.id);
    const childrenWithProducts = visibleChildren.filter((child) => categoryProductIds.has(child.id));
    const hasRootProducts = categoryProductIds.has(root.id);
    if (!hasRootProducts && childrenWithProducts.length === 0) continue;

    add(`/collections/${encodeURIComponent(root.slug)}`, root.updated_at);
    const childSlugCounts = new Map<string, number>();
    visibleChildren.forEach((child) => childSlugCounts.set(child.slug, (childSlugCounts.get(child.slug) ?? 0) + 1));
    for (const child of childrenWithProducts) {
      if ((childSlugCounts.get(child.slug) ?? 0) > 1) continue;
      add(`/collections/${encodeURIComponent(root.slug)}/${encodeURIComponent(child.slug)}`, child.updated_at);
    }
  }

  for (const product of publicProducts) {
    if (slugCounts.get(product.slug) !== 1) continue;
    add(`/products/${encodeURIComponent(product.slug)}`, product.updated_at);
  }

  return [...entries.values()];
}
