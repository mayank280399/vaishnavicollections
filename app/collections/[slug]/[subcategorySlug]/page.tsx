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

import ProductCard, {
  type StorefrontProduct,
} from "@/components/ProductCard/ProductCard";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
        "Collection Not Found | Vaishnavi Collections",
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
        "Category Not Found | Vaishnavi Collections",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    `${subcategory.name} | ${parent.name} | Vaishnavi Collections`;

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

export default async function SubcategoryPage({
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

  return (
    <><Navbar /><main className="min-h-screen bg-[#F8F7F4]">
      {/* ===================================================
        BREADCRUMB
    =================================================== */}

      <nav
        aria-label="Breadcrumb"
        className="border-b border-[#10233e]/10 bg-white px-4 py-3 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-[#10233e]/55">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-[#b18425]"
          >
            <Home size={13} />
            Home
          </Link>

          <ChevronRight size={13} />

          <Link
            href={`/collections/${parent.slug}`}
            className="hover:text-[#b18425]"
          >
            {parent.name}
          </Link>

          <ChevronRight size={13} />

          <span className="font-medium text-[#10233e]">
            {subcategory.name}
          </span>
        </div>
      </nav>

      {/* ===================================================
        HERO
    =================================================== */}

      <section className="bg-[#10233e]">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="flex items-center px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#b18425] sm:text-xs">
                {parent.name}
              </p>

              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                {subcategory.name}
              </h1>

              {subcategory.description && (
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                  {subcategory.description}
                </p>
              )}

              <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#d7bd7b]">
                <ShoppingBag size={15} />

                {products.length}{" "}
                {products.length === 1
                  ? "Product"
                  : "Products"}
              </div>
            </div>
          </div>

          {subcategory.image_url && (
            <div className="relative min-h-[260px] overflow-hidden sm:min-h-[340px]">
              <Image
                src={subcategory.image_url}
                alt={`${subcategory.name} - ${parent.name}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover" />

              <div className="absolute inset-0 bg-gradient-to-r from-[#10233e] via-transparent to-transparent" />
            </div>
          )}
        </div>
      </section>

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
                  className="w-full max-w-[220px] sm:w-[220px] lg:w-[240px]"
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
    </main> <Footer /></>
  );
}