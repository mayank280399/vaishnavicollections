import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Heart,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import ProductGallery from "@/components/ProductGallery/ProductGallery";
import ProductActions from "@/components/ProductActions/ProductActions";
import type { StorefrontProduct } from "@/components/ProductCard/ProductCard";
import SimilarProducts from "@/components/SimilarProducts/page";
import RelatedProducts from "@/components/RelatedProducts/page";
import StorefrontRouteLoading from "@/components/(storefront)/collection/StorefrontRouteLoading";
import { descriptionToEditorHtml, productDescriptionToText, sanitizeProductDescription } from "@/lib/utils/product-description";

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  product_title?: string | null;
  meta_title?: string | null;
  short_description?: string | null;
  size?: string | null;
  variant_label?: string | null;
  description?: string | null;
  category_id: string;
  sku: string | null;
  selling_price: number;
  cost_price: number | null;
  stock_quantity: number | null;
  online_enabled: boolean;
  online_price: number | null;
  visibility: string;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  active: boolean;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      `
        id,
        slug,
        name,
        product_title,
        meta_title,
        short_description,
        description,
        selling_price,
        online_price,
        online_enabled
      `,
    )
    .eq("slug", slug)
    .eq("visibility", "PUBLISHED")
    .eq("online_enabled", true)
    .maybeSingle();

  if (!product) {
    return {
      title: "Product",
    };
  }

  /* =======================================================
     PRIMARY PRODUCT IMAGE
  ======================================================= */

  const { data: imageData } = await supabase
    .from("product_images")
    .select(
      `
        image_url,
        is_primary
      `,
    )
    .eq("product_id", product.id)
    .order("is_primary", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  /* =======================================================
     PRODUCT NAME
  ======================================================= */

  const productName =
    product.product_title || product.name;
  const seoTitle =
    product.meta_title?.trim() || productName;

  /* =======================================================
     PRICE
  ======================================================= */

  const price =
    product.online_enabled &&
    product.online_price !== null &&
    product.online_price > 0
      ? product.online_price
      : product.selling_price;

  /* =======================================================
     DESCRIPTION
  ======================================================= */

  const rawDescription =
    product.short_description?.trim() ||
    productDescriptionToText(product.description)?.trim() ||
    `Discover this beautiful ${productName} from Vaishnavi Collections.`;

  const description =
    rawDescription.length > 160
      ? `${rawDescription
          .slice(0, 157)
          .trimEnd()}...`
      : rawDescription;

  /* =======================================================
     IMAGE
  ======================================================= */

  const imageUrl =
    imageData?.image_url || null;

  return {
    title: seoTitle,

    description,

    alternates: {
      canonical: `https://vaishnavicollections.vercel.app/products/${encodeURIComponent(product.slug)}`,
    },

    openGraph: {
      type: "website",
      siteName: "Vaishnavi Collections",
      title: seoTitle,
      description,

      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                width: 1200,
                height: 1200,
                alt: productName,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,

      ...(imageUrl
        ? {
            images: [imageUrl],
          }
        : {}),
    },

    other: {
      "product:price:amount": String(price),
      "product:price:currency": "INR",
    },
  };
}

/* =========================================================
   HELPERS
========================================================= */

async function getPrimaryImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productIds: string[],
) {
  if (productIds.length === 0) {
    return new Map<string, string>();
  }

  const { data: images, error } = await supabase
    .from("product_images")
    .select(
      `
        product_id,
        image_url,
        is_primary
      `,
    )
    .in("product_id", productIds)
    .order("is_primary", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Product image fetch error:",
      error,
    );
  }

  const imageMap = new Map<string, string>();

  for (const image of images || []) {
    if (!imageMap.has(image.product_id)) {
      imageMap.set(
        image.product_id,
        image.image_url,
      );
    }
  }

  return imageMap;
}

function mapToStorefrontProduct(
  product: {
    id: string;
    name: string;
    slug: string;
    product_title?: string | null;
    size?: string | null;
    variant_label?: string | null;
    selling_price: number;
    online_price: number | null;
    online_enabled: boolean;
    stock_quantity: number | null;
    featured?: boolean;
  },
  image: string | undefined,
  categoryName?: string | null,
): StorefrontProduct | null {
  if (!image) {
    return null;
  }

  const price =
    product.online_enabled &&
    product.online_price !== null &&
    product.online_price > 0
      ? product.online_price
      : product.selling_price;

  const originalPrice =
    product.online_enabled &&
    product.online_price !== null &&
    product.online_price > 0 &&
    product.online_price <
      product.selling_price
      ? product.selling_price
      : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    product_title:
      product.product_title ?? null,
    size: product.size ?? null,
    variantLabel: product.variant_label ?? null,
    image,
    price,
    originalPrice,
    category: categoryName ?? null,
    badge: product.featured
      ? "Featured"
      : null,
    stockQuantity:
      product.stock_quantity ?? null,
  };
}

/* =========================================================
   PAGE
========================================================= */

async function ProductContent({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  /* =======================================================
     CURRENT PRODUCT
  ======================================================= */

  const {
    data: productData,
    error: productError,
  } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        product_title,
        size,
        variant_label,
        description,
        category_id,
        sku,
        selling_price,
        cost_price,
        stock_quantity,
        online_enabled,
        online_price,
        visibility,
        featured
      `,
    )
    .eq("slug", slug)
    .eq("visibility", "PUBLISHED")
    .eq("online_enabled", true)
    .maybeSingle();

  if (productError) {
    console.error(
      "Product fetch error:",
      productError,
    );
  }

  if (!productData) {
    notFound();
  }

  const product = productData as Product;

  /* =======================================================
     PRODUCT IMAGES + CATEGORY

     These reads are independent after the current product is
     known, so run them together instead of serially.
  ======================================================= */

  const [productImagesResult, categoryResult] =
    await Promise.all([
      supabase
        .from("product_images")
        .select(`
          id,
          image_url,
          is_primary
        `)
        .eq("product_id", product.id)
        .order("is_primary", {
          ascending: false,
        }),
      supabase
        .from("product_categories")
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          parent_id,
          active
        `)
        .eq("id", product.category_id)
        .eq("active", true)
        .maybeSingle(),
    ]);

  if (productImagesResult.error) {
    console.error(
      "Product images error:",
      productImagesResult.error,
    );
  }

  const images: ProductImage[] =
    productImagesResult.data || [];

  const category =
    categoryResult.data as Category | null;

  /* =======================================================
     PARENT CATEGORY
  ======================================================= */

  let parentCategory: Category | null =
    null;

  if (category?.parent_id) {
    const { data: parentData } =
      await supabase
        .from("product_categories")
        .select(
          `
            id,
            name,
            slug,
            description,
            image_url,
            parent_id,
            active
          `,
        )
        .eq("id", category.parent_id)
        .eq("active", true)
        .maybeSingle();

    parentCategory =
      parentData as Category | null;
  } else if (category) {
    parentCategory = category;
  }

  /* =======================================================
     SIMILAR PRODUCTS

     Same subcategory as current product.
  ======================================================= */

  let similarProducts: StorefrontProduct[] =
    [];

  if (category) {
    const {
      data: similarData,
      error: similarError,
    } = await supabase
      .from("products")
      .select(
        `
          id,
          name,
          slug,
          product_title,
          size,
          variant_label,
          selling_price,
          online_price,
          online_enabled,
          stock_quantity,
          featured
        `,
      )
      .eq("category_id", category.id)
      .eq("visibility", "PUBLISHED")
      .eq("online_enabled", true)
      .neq("id", product.id)
      .limit(4);

    if (similarError) {
      console.error(
        "Similar products error:",
        similarError,
      );
    }

    if (
      similarData &&
      similarData.length > 0
    ) {
      const imageMap =
        await getPrimaryImages(
          supabase,
          similarData.map(
            (item) => item.id,
          ),
        );

      similarProducts = similarData
        .map((item) =>
          mapToStorefrontProduct(
            item,
            imageMap.get(item.id),
            category.name,
          ),
        )
        .filter(
          (
            item,
          ): item is StorefrontProduct =>
            item !== null,
        );
    }
  }

  /* =======================================================
     RELATED PRODUCTS

     Products from OTHER subcategories under
     the same parent category.
  ======================================================= */

  let relatedProducts: StorefrontProduct[] =
    [];

  if (parentCategory) {
    /* -----------------------------------------------------
       Find sibling subcategories
    ----------------------------------------------------- */

    const {
      data: siblingCategories,
      error: siblingError,
    } = await supabase
      .from("product_categories")
      .select(
        `
          id,
          name,
          slug,
          description,
          image_url,
          parent_id,
          active
        `,
      )
      .eq(
        "parent_id",
        parentCategory.id,
      )
      .eq("active", true)
      .neq(
        "id",
        category?.id || "",
      );

    if (siblingError) {
      console.error(
        "Related subcategories error:",
        siblingError,
      );
    }

    const siblingCategoryIds =
      siblingCategories?.map(
        (item) => item.id,
      ) || [];

    /* -----------------------------------------------------
       Find products from sibling subcategories
    ----------------------------------------------------- */

    if (
      siblingCategoryIds.length > 0
    ) {
      const {
        data: relatedData,
        error: relatedError,
      } = await supabase
        .from("products")
        .select(
          `
            id,
            name,
            slug,
            product_title,
            size,
            variant_label,
            category_id,
            selling_price,
            online_price,
            online_enabled,
            stock_quantity,
            featured
          `,
        )
        .in(
          "category_id",
          siblingCategoryIds,
        )
        .eq(
          "visibility",
          "PUBLISHED",
        )
        .eq(
          "online_enabled",
          true,
        )
        .neq(
          "id",
          product.id,
        )
        .limit(4);

      if (relatedError) {
        console.error(
          "Related products error:",
          relatedError,
        );
      }

      if (
        relatedData &&
        relatedData.length > 0
      ) {
        const imageMap =
          await getPrimaryImages(
            supabase,
            relatedData.map(
              (item) => item.id,
            ),
          );

        const categoryMap =
          new Map(
            (siblingCategories ||
              []).map((item) => [
              item.id,
              item.name,
            ]),
          );

        relatedProducts = relatedData
          .map((item) =>
            mapToStorefrontProduct(
              item,
              imageMap.get(item.id),
              categoryMap.get(
                item.category_id,
              ) || null,
            ),
          )
          .filter(
            (
              item,
            ): item is StorefrontProduct =>
              item !== null,
          );
      }
    }
  }

  /* =======================================================
     PRICE
  ======================================================= */

  const price =
    product.online_enabled &&
    product.online_price !== null &&
    product.online_price > 0
      ? product.online_price
      : product.selling_price;

  const originalPrice =
    product.online_enabled &&
    product.online_price !== null &&
    product.online_price > 0 &&
    product.online_price <
      product.selling_price
      ? product.selling_price
      : null;

  const isInStock =
    product.stock_quantity === null ||
    product.stock_quantity > 0;

  const productName = product.product_title || product.name;
  const productUrl = `https://vaishnavicollections.vercel.app/products/${encodeURIComponent(product.slug)}`;
  const productImages = images
    .map((image) => image.image_url)
    .filter((imageUrl) => Boolean(imageUrl));
  const productBreadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://vaishnavicollections.vercel.app/",
    },
    ...(parentCategory
      ? [{
          "@type": "ListItem",
          position: 2,
          name: parentCategory.name,
          item: `https://vaishnavicollections.vercel.app/collections/${encodeURIComponent(parentCategory.slug)}`,
        }]
      : []),
    ...(category && category.id !== parentCategory?.id
      ? [{
          "@type": "ListItem",
          position: parentCategory ? 3 : 2,
          name: category.name,
          item: `https://vaishnavicollections.vercel.app/collections/${encodeURIComponent(parentCategory?.slug ?? category.slug)}${parentCategory ? `/${encodeURIComponent(category.slug)}` : ""}`,
        }]
      : []),
    {
      "@type": "ListItem",
      position: (parentCategory ? (category && category.id !== parentCategory.id ? 4 : 3) : 2),
      name: productName,
      item: productUrl,
    },
  ];
  const productStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: productName,
        url: productUrl,
        description:
          product.short_description?.trim() ||
          productDescriptionToText(product.description) ||
          `Discover this beautiful ${productName} from Vaishnavi Collections. Each product is carefully selected for quality, style, and everyday use.`,
        ...(productImages.length ? { image: productImages } : {}),
        ...(product.sku ? { sku: product.sku } : {}),
        category: category?.name ?? parentCategory?.name,
        brand: {
          "@type": "Brand",
          name: "Vaishnavi Collections",
        },
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "INR",
          price: Number(price).toFixed(2),
          availability: isInStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            "@id": "https://vaishnavicollections.vercel.app/#organization",
            name: "Vaishnavi Collections",
          },
          hasMerchantReturnPolicy: {
            "@id": "https://vaishnavicollections.vercel.app/#return-policy",
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            hasShippingService: {
              "@id": "https://vaishnavicollections.vercel.app/#shipping-service",
            },
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: productBreadcrumbItems,
      },
    ],
  };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-w-0 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {/* =================================================
            BREADCRUMBS
        ================================================= */}

        <nav
          aria-label="Breadcrumb"
          className="
            mb-6
            flex
            min-w-0
            items-center
            gap-1.5
            overflow-hidden
            text-xs
            text-slate-500
          "
        >
          <Link
            href="/"
            className="
              shrink-0
              transition
              hover:text-[#c9a227]
            "
          >
            Home
          </Link>

          <ChevronRight
            className="h-3.5 w-3.5 shrink-0"
          />

          {parentCategory && (
            <>
              <Link
                href={`/collections/${parentCategory.slug}`}
                className="
                  max-w-[120px]
                  truncate
                  transition
                  hover:text-[#c9a227]
                  sm:max-w-none
                "
              >
                {parentCategory.name}
              </Link>

              <ChevronRight
                className="h-3.5 w-3.5 shrink-0"
              />
            </>
          )}

          {category &&
            category.id !==
              parentCategory?.id && (
              <>
                <Link
                  href={`/collections/${parentCategory?.slug}/${category.slug}`}
                  className="
                    max-w-[120px]
                    truncate
                    transition
                    hover:text-[#c9a227]
                    sm:max-w-none
                  "
                >
                  {category.name}
                </Link>

                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0"
                />
              </>
            )}

          <span
            className="
              min-w-0
              truncate
              font-medium
              text-slate-700
            "
          >
            {product.name}
          </span>
        </nav>

        {/* =================================================
            PRODUCT
        ================================================= */}

        <div
          className="
            grid
            min-w-0
            grid-cols-1
            gap-8
            lg:grid-cols-2
            lg:gap-12
          "
        >
          {/* ===============================================
              GALLERY
          ================================================ */}

          <div className="min-w-0">
            <ProductGallery
              images={images}
              productName={
                product.product_title ||
                product.name
              }
            />
          </div>

          {/* ===============================================
              PRODUCT INFORMATION
          ================================================ */}

          <div className="min-w-0">

            {/* Category */}

            {category && (
              <Link
                href={
                  parentCategory &&
                  category.id !==
                    parentCategory.id
                    ? `/collections/${parentCategory.slug}/${category.slug}`
                    : `/collections/${category.slug}`
                }
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-[#b18b17]
                  transition
                  hover:text-[#8f7110]
                "
              >
                {category.name}
              </Link>
            )}

            {/* Product Name */}

            <h1
              className="
                mt-2
                text-2xl
                font-semibold
                tracking-tight
                text-slate-900
                sm:text-3xl
              "
            >
              {product.product_title ||
                product.name}
            </h1>

            {(product.size || product.variant_label) && (
              <dl className="mt-3 flex flex-wrap gap-2 text-sm">
                {product.size && (
                  <div className="rounded-lg border border-[#10233e]/10 bg-[#10233e]/[0.03] px-3 py-2">
                    <dt className="inline text-slate-500">Size: </dt>
                    <dd className="inline font-semibold text-[#10233e]">{product.size}</dd>
                  </div>
                )}
                {product.variant_label && (
                  <div className="rounded-lg border border-[#10233e]/10 bg-[#10233e]/[0.03] px-3 py-2">
                    <dt className="inline text-slate-500">Design / Variant: </dt>
                    <dd className="inline font-semibold text-[#10233e]">{product.variant_label}</dd>
                  </div>
                )}
              </dl>
            )}

            {/* Featured */}

            {product.featured && (
              <div
                className="
                  mt-3
                  inline-flex
                  rounded-full
                  bg-[#c9a227]/10
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-[#9a7814]
                "
              >
                Featured
              </div>
            )}

            {/* Price */}

            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <span
                className="
                  text-2xl
                  font-semibold
                  text-slate-900
                  sm:text-3xl
                "
              >
                ₹
                {price.toLocaleString(
                  "en-IN",
                )}
              </span>

              {originalPrice && (
                <span
                  className="
                    text-base
                    text-slate-400
                    line-through
                  "
                >
                  ₹
                  {originalPrice.toLocaleString(
                    "en-IN",
                  )}
                </span>
              )}
            </div>

            {/* Stock */}

            <div className="mt-3">
              {isInStock ? (
                <span
                  className="
                    text-sm
                    font-medium
                    text-emerald-600
                  "
                >
                  In Stock
                  {product.stock_quantity !==
                    null &&
                    ` • ${product.stock_quantity} available`}
                </span>
              ) : (
                <span
                  className="
                    text-sm
                    font-medium
                    text-red-600
                  "
                >
                  Currently unavailable
                </span>
              )}
            </div>

            {/* Description */}

            <div
              className="
                mt-6
                border-t
                border-slate-200
                pt-6
              "
            >
              <h2
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                Product Details
              </h2>

              <div
                className="product-description-content mt-2 text-sm leading-6 text-slate-600"
                dangerouslySetInnerHTML={{
                  __html: sanitizeProductDescription(
                    descriptionToEditorHtml(
                      product.description?.trim() ||
                        `Discover this beautiful ${
                          product.product_title || product.name
                        } from Vaishnavi Collections. Each product is carefully selected for quality, style, and everyday use.`
                    )
                  ),
                }}
              />
              <style>{`
                .product-description-content p { margin: 0.5rem 0; }
                .product-description-content h2,
                .product-description-content h3,
                .product-description-content h4 { margin: 1rem 0 0.4rem; font-weight: 600; color: #0f172a; }
                .product-description-content ul { list-style: disc; padding-left: 1.4rem; margin: 0.6rem 0; }
                .product-description-content ol { list-style: decimal; padding-left: 1.4rem; margin: 0.6rem 0; }
                .product-description-content li { padding-left: 0.15rem; margin: 0.2rem 0; }
                .product-description-content a { color: #1d4ed8; text-decoration: underline; overflow-wrap: anywhere; }
                .product-description-content blockquote { border-left: 3px solid #c9a227; padding-left: 0.75rem; margin: 0.75rem 0; }
              `}</style>
            </div>

            {/* SKU */}

            {product.sku && (
              <div
                className="
                  mt-5
                  text-xs
                  text-slate-500
                "
              >
                SKU:{" "}
                <span
                  className="
                    font-medium
                    text-slate-700
                  "
                >
                  {product.sku}
                </span>
              </div>
            )}

            {/* =============================================
                PRODUCT ACTIONS
            ============================================== */}

            <ProductActions
              productId={product.id}
              productSlug={product.slug}
              productImage={
                images.find((image) => image.is_primary)?.image_url ||
                images[0]?.image_url ||
                null
              }
              productPrice={
                product.online_enabled &&
                product.online_price !== null &&
                product.online_price > 0
                  ? product.online_price
                  : product.selling_price
              }
              productCategory={category?.name}
              productName={
                product.product_title ||
                product.name
              }
              stockQuantity={
                product.stock_quantity
              }
              disabled={!isInStock}
            />

            {/* =============================================
                TRUST INFO
            ============================================== */}

            <div
              className="
                mt-8
                grid
                grid-cols-1
                gap-3
                border-t
                border-slate-200
                pt-6
                sm:grid-cols-3
              "
            >
              <div className="flex items-start gap-2.5">
                <Truck
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-[#c9a227]
                  "
                />

                <div>
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-slate-800
                    "
                  >
                    Delivery
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      leading-4
                      text-slate-500
                    "
                  >
                    Pan India shipping
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-[#c9a227]
                  "
                />

                <div>
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-slate-800
                    "
                  >
                    Quality
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      leading-4
                      text-slate-500
                    "
                  >
                    Carefully selected products
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Heart
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-[#c9a227]
                  "
                />

                <div>
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-slate-800
                    "
                  >
                    Loved by you
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      leading-4
                      text-slate-500
                    "
                  >
                    Shop from Vaishnavi
                    Collections
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            SIMILAR PRODUCTS
        ================================================= */}

        <SimilarProducts
          products={similarProducts}
        />

        {/* =================================================
            RELATED PRODUCTS
        ================================================= */}

        <RelatedProducts
          products={relatedProducts}
        />
      </div>
    </main>
  );
}

/**
 * Render the route shell immediately and stream the Supabase-backed
 * product content behind a Suspense boundary. The storefront layout
 * (including its header and navigation) stays visible while this loads.
 */
export default function ProductPage({ params }: PageProps) {
  return (
    <Suspense fallback={<StorefrontRouteLoading variant="product" />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
