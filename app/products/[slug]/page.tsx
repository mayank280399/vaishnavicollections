import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight,Heart, ShieldCheck, Truck,} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductGallery from "@/components/ProductGallery/ProductGallery";
import type { StorefrontProduct } from "@/components/ProductCard/ProductCard";
import SimilarProducts from "@/components/SimilarProducts/page";
import RelatedProducts from "@/components/RelatedProducts/page";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

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

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      name,
      product_title,
      selling_price,
      online_price,
      online_enabled
    `)
    .eq("slug", slug)
    .eq("visibility", "PUBLISHED")
    .eq("online_enabled", true)
    .maybeSingle();

  if (!product) {
    return {
      title: "Product | Vaishnavi Collections",
    };
  }

  const price =
    product.online_enabled &&
    product.online_price !== null &&
    product.online_price > 0
      ? product.online_price
      : product.selling_price;

  return {
    title: `${product.product_title || product.name} | Vaishnavi Collections`,
    description: `Shop ${product.product_title || product.name} from Vaishnavi Collections.`,
    openGraph: {
      title: `${product.product_title || product.name} | Vaishnavi Collections`,
      description: `Shop ${product.product_title || product.name} from Vaishnavi Collections.`,
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
  productIds: string[]
) {
  if (productIds.length === 0) {
    return new Map<string, string>();
  }

  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, image_url, is_primary")
    .in("product_id", productIds)
    .order("is_primary", { ascending: false });

  const imageMap = new Map<string, string>();

  for (const image of images || []) {
    if (!imageMap.has(image.product_id)) {
      imageMap.set(image.product_id, image.image_url);
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
    selling_price: number;
    online_price: number | null;
    online_enabled: boolean;
    stock_quantity: number | null;
    featured?: boolean;
  },
  image: string | undefined,
  categoryName?: string | null
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
    product.online_price < product.selling_price
      ? product.selling_price
      : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    product_title: product.product_title ?? null,
    image,
    price,
    originalPrice,
    category: categoryName ?? null,
    badge: product.featured ? "Featured" : null,
    stockQuantity: product.stock_quantity ?? null,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  /* =======================================================
     CURRENT PRODUCT
  ======================================================= */

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      product_title,
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
    `)
    .eq("slug", slug)
    .eq("visibility", "PUBLISHED")
    .eq("online_enabled", true)
    .maybeSingle();

  if (productError) {
    console.error("Product fetch error:", productError);
  }

  if (!productData) {
    notFound();
  }

  const product = productData as Product;

  /* =======================================================
     PRODUCT IMAGES
  ======================================================= */

  const { data: productImagesData } = await supabase
    .from("product_images")
    .select(`
      id,
      image_url,
      is_primary
    `)
    .eq("product_id", product.id)
    .order("is_primary", { ascending: false });

  const images: ProductImage[] = productImagesData || [];

  /* =======================================================
     CURRENT CATEGORY / SUBCATEGORY
  ======================================================= */

  const { data: categoryData } = await supabase
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
    .maybeSingle();

  const category = categoryData as Category | null;

  /* =======================================================
     PARENT CATEGORY
  ======================================================= */

  let parentCategory: Category | null = null;

  if (category?.parent_id) {
    const { data: parentData } = await supabase
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
      .eq("id", category.parent_id)
      .eq("active", true)
      .maybeSingle();

    parentCategory = parentData as Category | null;
  } else if (category) {
    // If the product is directly inside a parent category,
    // treat the current category as the parent.
    parentCategory = category;
  }

  /* =======================================================
     SIMILAR PRODUCTS
     
     Same subcategory as current product.
  ======================================================= */

  let similarProducts: StorefrontProduct[] = [];

  if (category) {
    const { data: similarData, error: similarError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        product_title,
        selling_price,
        online_price,
        online_enabled,
        stock_quantity,
        featured
      `)
      .eq("category_id", category.id)
      .eq("visibility", "PUBLISHED")
      .eq("online_enabled", true)
      .neq("id", product.id)
      .limit(4);

    if (similarError) {
      console.error("Similar products error:", similarError);
    }

    if (similarData && similarData.length > 0) {
      const imageMap = await getPrimaryImages(
        supabase,
        similarData.map((item) => item.id)
      );

      similarProducts = similarData
        .map((item) =>
          mapToStorefrontProduct(
            item,
            imageMap.get(item.id),
            category.name
          )
        )
        .filter((item): item is StorefrontProduct => item !== null);
    }
  }

  /* =======================================================
     RELATED PRODUCTS
     
     Products from OTHER subcategories under the same
     parent category.
     
     Example:
     
     Hair Accessories
       ├── Scrunchies       ← current
       ├── Hair Bows        ← related
       └── Hair Clips       ← related
  ======================================================= */

  let relatedProducts: StorefrontProduct[] = [];

  if (parentCategory) {
    /* -------------------------------------------------------
       Find sibling subcategories
    ------------------------------------------------------- */

    const siblingCategoryQuery = supabase
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
      .eq("parent_id", parentCategory.id)
      .eq("active", true)
      .neq("id", category?.id || "");

    const { data: siblingCategories, error: siblingError } =
      await siblingCategoryQuery;

    if (siblingError) {
      console.error(
        "Related subcategories error:",
        siblingError
      );
    }

    const siblingCategoryIds =
      siblingCategories?.map((item) => item.id) || [];

    /* -------------------------------------------------------
       Find products from sibling subcategories
    ------------------------------------------------------- */

    if (siblingCategoryIds.length > 0) {
      const { data: relatedData, error: relatedError } =
        await supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            product_title,
            category_id,
            selling_price,
            online_price,
            online_enabled,
            stock_quantity,
            featured
          `)
          .in("category_id", siblingCategoryIds)
          .eq("visibility", "PUBLISHED")
          .eq("online_enabled", true)
          .neq("id", product.id)
          .limit(4);

      if (relatedError) {
        console.error(
          "Related products error:",
          relatedError
        );
      }

      if (relatedData && relatedData.length > 0) {
        const imageMap = await getPrimaryImages(
          supabase,
          relatedData.map((item) => item.id)
        );

        const categoryMap = new Map(
          (siblingCategories || []).map((item) => [
            item.id,
            item.name,
          ])
        );

        relatedProducts = relatedData
          .map((item) =>
            mapToStorefrontProduct(
              item,
              imageMap.get(item.id),
              categoryMap.get(item.category_id) || null
            )
          )
          .filter(
            (item): item is StorefrontProduct => item !== null
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
    product.online_price < product.selling_price
      ? product.selling_price
      : null;

  const isInStock =
    product.stock_quantity === null ||
    product.stock_quantity > 0;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <><Navbar /><main className="min-w-0 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* =================================================
        BREADCRUMBS
    ================================================= */}

        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-slate-500"
        >
          <Link
            href="/"
            className="shrink-0 transition hover:text-[#c9a227]"
          >
            Home
          </Link>

          <ChevronRight className="h-3.5 w-3.5 shrink-0" />

          {parentCategory && (
            <>
              <Link
                href={`/collections/${parentCategory.slug}`}
                className="max-w-[120px] truncate transition hover:text-[#c9a227] sm:max-w-none"
              >
                {parentCategory.name}
              </Link>

              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            </>
          )}

          {category && category.id !== parentCategory?.id && (
            <>
              <Link
                href={`/collections/${parentCategory?.slug}/${category.slug}`}
                className="max-w-[120px] truncate transition hover:text-[#c9a227] sm:max-w-none"
              >
                {category.name}
              </Link>

              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            </>
          )}

          <span className="min-w-0 truncate font-medium text-slate-700">
            {product.name}
          </span>
        </nav>

        {/* =================================================
        PRODUCT
    ================================================= */}

        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* ===============================================
        GALLERY
    ================================================ */}

          <div className="min-w-0">
            <ProductGallery
              images={images}
              productName={product.product_title || product.name} />
          </div>

          {/* ===============================================
        PRODUCT INFORMATION
    ================================================ */}

          <div className="min-w-0">
            {/* Category */}
            {category && (
              <Link
                href={parentCategory && category.id !== parentCategory.id
                  ? `/collections/${parentCategory.slug}/${category.slug}`
                  : `/collections/${category.slug}`}
                className="text-xs font-medium uppercase tracking-[0.15em] text-[#b18b17] transition hover:text-[#8f7110]"
              >
                {category.name}
              </Link>
            )}

            {/* Product Name */}
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {product.product_title || product.name}
            </h1>

            {/* Featured */}
            {product.featured && (
              <div className="mt-3 inline-flex rounded-full bg-[#c9a227]/10 px-3 py-1 text-xs font-medium text-[#9a7814]">
                Featured
              </div>
            )}

            {/* Price */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                ₹{price.toLocaleString("en-IN")}
              </span>

              {originalPrice && (
                <span className="text-base text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mt-3">
              {isInStock ? (
                <span className="text-sm font-medium text-emerald-600">
                  In Stock
                  {product.stock_quantity !== null &&
                    ` • ${product.stock_quantity} available`}
                </span>
              ) : (
                <span className="text-sm font-medium text-red-600">
                  Currently unavailable
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Product Details
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {product.description ||
                  `Discover this beautiful ${product.product_title || product.name} from Vaishnavi Collections. Each product is carefully selected for quality, style, and everyday use.`}
              </p>
            </div>

            {/* SKU */}
            {product.sku && (
              <div className="mt-5 text-xs text-slate-500">
                SKU:{" "}
                <span className="font-medium text-slate-700">
                  {product.sku}
                </span>
              </div>
            )}

            {/* =============================================
        PRODUCT ACTIONS
    ============================================== */}

            <ProductActions
              disabled={!isInStock}
              productId={product.id} />

            {/* =============================================
        TRUST INFO
    ============================================== */}

            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3">
              <div className="flex items-start gap-2.5">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a227]" />

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Delivery
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    Pan India shipping
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a227]" />

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Quality
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    Carefully selected products
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Heart className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a227]" />

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Loved by you
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    Shop from Vaishnavi Collections
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
        SIMILAR PRODUCTS
    ================================================= */}

        <SimilarProducts products={similarProducts} />

        {/* =================================================
        RELATED PRODUCTS
    ================================================= */}

        <RelatedProducts products={relatedProducts} />
      </div>
    </main> <Footer /></>
  );
}

/* =========================================================
   PRODUCT ACTIONS
========================================================= */

interface ProductActionsProps {
  productId: string;
  disabled?: boolean;
}

function ProductActions({
  productId,
  disabled = false,
}: ProductActionsProps) {
  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        disabled={disabled}
        data-product-id={productId}
        className="
          flex
          min-h-11
          flex-1
          items-center
          justify-center
          rounded-lg
          bg-[#0f2747]
          px-5
          text-sm
          font-medium
          text-white
          transition
          hover:bg-[#17365f]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {disabled ? "Out of Stock" : "Add to Cart"}
      </button>

      <button
        type="button"
        aria-label="Add to wishlist"
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-slate-200
          text-slate-700
          transition
          hover:border-[#c9a227]
          hover:text-[#b18b17]
        "
      >
        <Heart className="h-5 w-5" />
      </button>
    </div>
  );
}