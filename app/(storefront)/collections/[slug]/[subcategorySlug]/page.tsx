import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductCard, { type StorefrontProduct} from "@/components/ProductCard/ProductCard";
import CollectionBanner from "@/components/(storefront)/collection/CollectionBanner";
import BreadCrumb from "@/components/(storefront)/collection/BreadCrumb";
import { ShoppingBag } from "lucide-react";
import StorefrontRouteLoading from "@/components/(storefront)/collection/StorefrontRouteLoading";


type PageProps = {
  params: Promise<{
    slug: string;
    subcategorySlug: string;
  }>;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  banner_image_url: string | null;
  parent_id: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  selling_price: number | null;
  online_price: number | null;
  online_enabled: boolean | null;
  stock_quantity: number | null;
  visibility: string | null;
  featured: boolean | null;
  category_id: string | null;
};

type ProductImage = {
  product_id: string;
  image_url: string;
  is_primary: boolean | null;
};

const SITE_URL = "https://vaishnavicollections.vercel.app";

/* =========================================================
   PARENT CATEGORY
========================================================= */

async function getParentCategory(
  slug: string,
): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_categories")
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      banner_image_url,
      parent_id
    `)
    .eq("slug", slug)
    .eq("category_type", "PRODUCT")
    .eq("active", true)
    .is("parent_id", null)
    .maybeSingle();

  if (error) {
    console.error("Parent category error:", error);
    return null;
  }

  return data;
}

/* =========================================================
   SUBCATEGORY
========================================================= */

async function getSubcategory(
  parentId: string,
  subcategorySlug: string,
): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_categories")
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      banner_image_url,
      parent_id
    `)
    .eq("slug", subcategorySlug)
    .eq("parent_id", parentId)
    .eq("category_type", "PRODUCT")
    .eq("show_subcategory",true)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Subcategory error:", error);
    return null;
  }

  return data;
}

/* =========================================================
   PRODUCTS
========================================================= */

async function getProducts(
  categoryId: string,
  categoryName: string,
): Promise<StorefrontProduct[]> {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      product_title,
      slug,
      selling_price,
      online_price,
      online_enabled,
      stock_quantity,
      visibility,
      featured,
      category_id
    `)
    .eq("category_id", categoryId)
    .eq("visibility", "PUBLISHED")
    .eq("online_enabled", true)
    .order("featured", {
      ascending: false,
    })
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error("Products error:", error);
    return [];
  }

  if (!products?.length) {
    return [];
  }

  const productIds = products.map(
    (product) => product.id,
  );

  const { data: images, error: imageError } =
    await supabase
      .from("product_images")
      .select(`
        product_id,
        image_url,
        is_primary
      `)
      .in("product_id", productIds)
      .order("is_primary", {
        ascending: false,
      });

  if (imageError) {
    console.error(
      "Product images error:",
      imageError,
    );
  }

  const imageMap = new Map<string, string>();

  for (const image of images ?? []) {
    if (!imageMap.has(image.product_id)) {
      imageMap.set(
        image.product_id,
        image.image_url,
      );
    }
  }

  return products
    .map((product) => {
      const image = imageMap.get(product.id);

      if (!image) {
        return null;
      }

      const sellingPrice = Number(
        product.selling_price ?? 0,
      );

      const onlinePrice =
        product.online_price != null
          ? Number(product.online_price)
          : sellingPrice;

      const originalPrice =
        onlinePrice < sellingPrice
          ? sellingPrice
          : null;

      return {
        id: String(product.id),
        product_title: product.product_title,
        name: product.name,
        slug: product.slug,
        image,
        price: onlinePrice,
        originalPrice,
        category: categoryName,
        badge: product.featured
          ? "Featured"
          : null,
        stockQuantity:
          product.stock_quantity != null
            ? Number(product.stock_quantity)
            : null,
      };
    })
    .filter(
      Boolean,
    ) as StorefrontProduct[];
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    slug,
    subcategorySlug,
  } = await params;

  const parent =
    await getParentCategory(slug);

  if (!parent) {
    return {
      title:
        "Collection Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const subcategory =
    await getSubcategory(
      parent.id,
      subcategorySlug,
    );

  if (!subcategory) {
    return {
      title:
        "Category Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    `Shop ${subcategory.name} Online | ${parent.name}`;

  const description =
    subcategory.description ||
    `Explore ${subcategory.name} from our ${parent.name} collection at Vaishnavi Collections.`;

  const canonical =
    `${SITE_URL}/collections/${parent.slug}/${subcategory.slug}`;

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Vaishnavi Collections",
      type: "website",

      ...(subcategory.image_url
        ? {
            images: [
              {
                url: subcategory.image_url,
                alt: subcategory.name,
              },
            ],
          }
        : {}),
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

async function SubcategoryContent({
  params,
}: PageProps) {
  const {
    slug,
    subcategorySlug,
  } = await params;

  /*
   * STEP 1
   * Find parent
   */
  const parent =
    await getParentCategory(slug);

  if (!parent) {
    notFound();
  }

  /*
   * STEP 2
   * Find child category belonging
   * specifically to this parent.
   */
  const subcategory =
    await getSubcategory(
      parent.id,
      subcategorySlug,
    );

  if (!subcategory) {
    notFound();
  }

  /*
   * STEP 3
   * Fetch products ONLY from
   * this subcategory.
   */
  const products =
    await getProducts(
      subcategory.id,
      subcategory.name,
    );

  const canonical = `${SITE_URL}/collections/${encodeURIComponent(parent.slug)}/${encodeURIComponent(subcategory.slug)}`;
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL + "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: parent.name,
        item: `${SITE_URL}/collections/${encodeURIComponent(parent.slug)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: subcategory.name,
        item: canonical,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#F8F7F4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      {/* ===================================================
        HERO
    =================================================== */}

      <CollectionBanner
        title={subcategory.name}
        description={subcategory.description ?? undefined}
        bannerImageUrl={subcategory.banner_image_url ?? undefined}
        eyebrow={parent.name}
        productCount={products.length} />

     {/* ===================================================
        BREADCRUMB
    =================================================== */}
      <BreadCrumb subcategory={subcategory.name} parent={parent} />
  
      {/* ===================================================
        PRODUCTS
    =================================================== */}

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18425]">
              Shop now
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#10233e]">
              {subcategory.name}
            </h2>

            <p className="mt-1 text-sm text-[#10233e]/55">
              {products.length}{" "}
              {products.length === 1
                ? "product"
                : "products"}
            </p>
          </div>

          {products.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)]"
                >
                  <ProductCard
                    product={product}
                    index={index} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#10233e]/10 bg-white px-6 text-center">
              <div>
                <ShoppingBag
                  size={32}
                  className="mx-auto text-[#b18425]" />

                <h3 className="mt-4 text-lg font-semibold text-[#10233e]">
                  Products coming soon
                </h3>

                <p className="mt-2 max-w-md text-sm text-[#10233e]/55">
                  We are adding products to this
                  collection. Please check back soon.
                </p>

                <Link
                  href={`/collections/${parent.slug}`}
                  className="mt-5 inline-flex rounded-full bg-[#10233e] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1b3557]"
                >
                  Browse {parent.name}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/**
 * Keep the shared storefront layout visible and stream subcategory
 * data behind a branded shell instead of blocking the whole route.
 */
export default function SubcategoryPage({ params }: PageProps) {
  return (
    <Suspense fallback={<StorefrontRouteLoading variant="collection" />}>
      <SubcategoryContent params={params} />
    </Suspense>
  );
}
