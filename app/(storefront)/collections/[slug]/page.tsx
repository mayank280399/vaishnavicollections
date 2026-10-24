import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import StorefrontRouteLoading from "@/components/(storefront)/collection/StorefrontRouteLoading";
import {
  ChevronRight,
  Home,
  ShoppingBag,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import CollectionSubcategoryCard, { CollectionSubcategory } from "@/components/(storefront)/collection/CollectionSubcategoryCard";
import CollectionProductGrid, { CollectionProduct } from "@/components/(storefront)/collection/CollectionProductGrid";
import CollectionBanner from "@/components/(storefront)/collection/CollectionBanner";
import BreadCrumb from "@/components/(storefront)/collection/BreadCrumb";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_image_url : string | null;
  image_url: string | null;
  parent_id: string | null;
  category_type: string;
  active: boolean;
};

type ProductImage = {
  product_id: string;
  image_url: string;
  is_primary: boolean | null;
};

const SITE_URL = "https://vaishnavicollections.vercel.app";

/* =========================================================
   CATEGORY
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
      parent_id,
      category_type,
      active
    `)
    .eq("slug", slug)
    .eq("category_type", "PRODUCT")
    .eq("active", true)
    .is("parent_id", null)
    .maybeSingle();

  if (error) {
    console.error("Parent collection error:", error);
    return null;
  }
  console.log("Parent collection data:", data);
  return data as Category | null;
}

/* =========================================================
   SUBCATEGORIES
========================================================= */

async function getSubcategories(
  parentId: string,
): Promise<CollectionSubcategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_categories")
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      banner_image_url
    `)
    .eq("parent_id", parentId)
    .eq("category_type", "PRODUCT")
    .eq("active", true)
      .eq("show_subcategory", true)
    .order("sort_order", {
      ascending: true,
      nullsFirst: false,
    })
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error("Subcategories error:", error);
    return [];
  }

  return (data ?? []) as CollectionSubcategory[];
}

/* =========================================================
   PRODUCTS
========================================================= */

async function getProductsForCategories(
  categoryIds: string[],
  fallbackCategoryName: string,
): Promise<CollectionProduct[]> {
  if (!categoryIds.length) {
    return [];
  }

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
    .in("category_id", categoryIds)
    .eq("visibility", "PUBLISHED")
    .eq("online_enabled", true)
    .order("featured", {
      ascending: false,
    })
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error("Collection products error:", error);
    return [];
  }

  if (!products?.length) {
    return [];
  }

  const productIds = products.map((product) => product.id);

  const { data: images, error: imagesError } = await supabase
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

  if (imagesError) {
    console.error("Collection product images error:", imagesError);
  }

  const imageMap = new Map<string, ProductImage>();

  for (const image of images ?? []) {
    if (!imageMap.has(image.product_id)) {
      imageMap.set(image.product_id, image as ProductImage);
    }
  }

  return products
    .map((product) => {
      const image = imageMap.get(product.id);

      if (!image?.image_url) {
        return null;
      }

      const price =
        product.online_price != null
          ? Number(product.online_price)
          : Number(product.selling_price ?? 0);

      return {
        id: String(product.id),
        name: product.name,
        product_title: product.product_title,
        slug: product.slug,
        image: image.image_url,
        price,
        originalPrice: null,
        category: fallbackCategoryName,
        badge: product.featured ? "Featured" : null,
        stockQuantity:
          product.stock_quantity != null
            ? Number(product.stock_quantity)
            : null,
      };
    })
    .filter(Boolean) as CollectionProduct[];
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const category = await getParentCategory(slug);

  if (!category) {
    return {
      title: "Collection Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `Shop ${category.name} Online`;

  const description =
    category.description?.trim() ||
    `Explore ${category.name} at Vaishnavi Collections. Discover our curated collection and shop online with Pan India delivery.`;

  const canonical = `${SITE_URL}/collections/${encodeURIComponent(
    category.slug,
  )}`;

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
      ...(category.image_url
        ? {
            images: [
              {
                url: category.image_url,
                alt: category.name,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(category.image_url
        ? {
            images: [category.image_url],
          }
        : {}),
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

async function ParentCollectionContent({
  params,
}: PageProps) {
  const { slug } = await params;

  const category = await getParentCategory(slug);

  if (!category) {
    notFound();
  }

  const subcategories = await getSubcategories(category.id);

  const categoryIds = [
    category.id,
    ...subcategories.map((subcategory) => subcategory.id),
  ];

  const products = await getProductsForCategories(
    categoryIds,
    category.name,
  );

  const canonical = `${SITE_URL}/collections/${encodeURIComponent(
    category.slug,
  )}`;

  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: category.name,
            item: canonical,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#collection`,
        name: category.name,
        url: canonical,
        ...(category.description?.trim()
          ? { description: category.description.trim() }
          : {}),
        ...(category.image_url
          ? { primaryImageOfPage: category.image_url }
          : {}),
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
            item: {
              "@type": "Product",
              name: product.product_title || product.name,
              url: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
              image: product.image,
            },
          })),
        },
      },
    ],
  };

  return (
    <main className="w-full overflow-hidden bg-[#F8F7F4]">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionStructuredData).replace(/</g, "\\u003c"),
        }} />

      {/* =====================================================
        HERO
    ====================================================== */}
   
      <CollectionBanner
        title={category.name}
        description={category.description ?? undefined}
        productCount={products.length}
        bannerImageUrl={category.banner_image_url ?? category.image_url ?? undefined} />

        
      {/* =====================================================
        BREADCRUMB
    ====================================================== */}
    <BreadCrumb subcategory={category.name} />
    


      {/* =====================================================
        SUBCATEGORIES
    ====================================================== */}
      {subcategories.length > 0 && (
        <section
          aria-labelledby="collection-categories-heading"
          className="px-4 py-9 sm:px-6 sm:py-12 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <header className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18425]">
                Browse the collection
              </p>

              <h2
                id="collection-categories-heading"
                className="mt-1 text-2xl font-bold text-[#10233e]"
              >
                Shop by Category
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Explore different categories within our{" "}
                {category.name.toLowerCase()} collection.
              </p>
            </header>

            <div className="flex flex-wrap justify-center gap-4">
              {subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)]"
                >
                  <CollectionSubcategoryCard
                    category={subcategory}
                    parentSlug={category.slug} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
        ALL PRODUCTS
    ====================================================== */}
      <section
        aria-labelledby="collection-products-heading"
        className="px-4 pb-12 pt-3 sm:px-6 sm:pb-16 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4 border-t border-[#1B263B]/10 pt-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b18425]">
                Shop the collection
              </p>

              <h2
                id="collection-products-heading"
                className="mt-1 text-xl font-bold text-[#10233e] sm:text-2xl"
              >
                All {category.name}
              </h2>
            </div>

            <span className="shrink-0 text-xs text-[#10233e]/50">
              {products.length}{" "}
              {products.length === 1
                ? "item"
                : "items"}
            </span>
          </div>
          <CollectionProductGrid products={products} />
        </div>
      </section>
    </main>
  );
}

/**
 * Keep the shared storefront layout visible and show the collection
 * shell immediately while category, subcategory, and product data loads.
 */
export default function ParentCollectionPage({ params }: PageProps) {
  return (
    <Suspense fallback={<StorefrontRouteLoading variant="collection" />}>
      <ParentCollectionContent params={params} />
    </Suspense>
  );
}
