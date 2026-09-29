import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Home,
  ShoppingBag,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import CollectionSubcategoryCard, { CollectionSubcategory } from "@/components/collection/CollectionSubcategoryCard";
import CollectionProductGrid, { CollectionProduct } from "@/components/collection/CollectionProductGrid";
import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";



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
  image_url: string | null;
  parent_id: string | null;
  category_type: string;
  active: boolean;
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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://vaishnavicollections.vercel.app";

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
      image_url
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
      title: "Collection Not Found | Vaishnavi Collections",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${category.name} | Vaishnavi Collections`;

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

export default async function ParentCollectionPage({
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
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
  };

  return (
    <><Navbar /><main className="w-full overflow-hidden bg-[#F8F7F4]">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }} />

      {/* =====================================================
        BREADCRUMB
    ====================================================== */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-[#1B263B]/10 bg-white px-4 py-3 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-[#1B263B]/55">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1 transition hover:text-[#C88A3D]"
          >
            <Home size={13} />
            Home
          </Link>

          <ChevronRight size={13} />

          <span className="font-medium text-[#1B263B]">
            {category.name}
          </span>
        </div>
      </nav>

      {/* =====================================================
        HERO
    ====================================================== */}
      <section className="bg-[#10233e]">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex items-center px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#b18425] sm:text-xs">
                Vaishnavi Collections
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {category.name}
              </h1>

              {category.description && (
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
                  {category.description}
                </p>
              )}

              <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#d7bd7b]">
                <ShoppingBag size={15} />

                {products.length}{" "}
                {products.length === 1
                  ? "product"
                  : "products"}
              </div>
            </div>
          </div>

          {category.image_url && (
            <div className="relative min-h-[260px] overflow-hidden sm:min-h-[340px] lg:min-h-[400px]">
              <Image
                src={category.image_url}
                alt={`${category.name} collection`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover" />

              <div className="absolute inset-0 bg-gradient-to-r from-[#10233e] via-transparent to-transparent lg:from-[#10233e]/60" />
            </div>
          )}
        </div>
      </section>

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
    </main><Footer /></>
  );
}