import { createClient } from "@/lib/supabase/server";
import FeaturedProductsClient from "./FeaturedProductsClient";

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  selling_price: number | null;
  online_price: number | null;
  stock_quantity: number | null;
  online_enabled: boolean;
  featured: boolean;
  visibility: string;

  product_categories:
    | {
        name: string;
        slug: string;
      }[]
    | null;

  product_images:
    | {
        image_url: string;
        alt_text: string | null;
        is_primary: boolean;
        sort_order: number | null;
      }[]
    | null;
};

async function getFeaturedProducts(): Promise<DbProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      selling_price,
      online_price,
      stock_quantity,
      online_enabled,
      featured,
      visibility,
      product_categories (
        name,
        slug
      ),
      product_images (
        image_url,
        alt_text,
        is_primary,
        sort_order
      )
    `)
    .eq("featured", true)
    .eq("online_enabled", true)
    .eq("visibility", "PUBLISHED")
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Featured products error:", error);
    return [];
  }

  return (data ?? []) as DbProduct[];
}

function getPrimaryImage(product: DbProduct) {
  const images = [...(product.product_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  return (
    images.find((image) => image.is_primary) ??
    images[0] ??
    null
  );
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  const featured = products
    .map((product) => {
      const primaryImage = getPrimaryImage(product);

      if (!primaryImage?.image_url) {
        return null;
      }

      const price =
        product.online_price ?? product.selling_price ?? 0;

      const category = product.product_categories?.[0];

      return {
        id: product.id,
        name: product.name,
        image: primaryImage.image_url,
        price,
        originalPrice: null,
        category: category?.name ?? "Products",
        stockQuantity: product.stock_quantity,
        badge: null,
      };
    })
    .filter(
      (product): product is NonNullable<typeof product> =>
        product !== null,
    );

  if (!featured.length) {
    return null;
  }

  return <FeaturedProductsClient products={featured} />;
}