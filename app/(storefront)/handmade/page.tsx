"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Loader2,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useShopping } from "@/context/ShoppingContext";

type Product = {
  id: string;
  category_id: string | null;
  sku: string | null;
  name: string;
  slug: string;
  product_title: string | null;
  short_description: string | null;
  selling_price: number | null;
  cost_price: number | null;
  stock_quantity: number | null;
  online_enabled: boolean;
  online_price: number | null;
  visibility: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  created_at: string;

  /*
   * Image is loaded from product_images rather than
   * products.primary_image_url because that column
   * does not exist in the current database schema.
   */
  primary_image_url: string | null;

  is_handmade: boolean;
  is_made_to_order: boolean;
  bulk_orders_available: boolean;
  handmade_featured: boolean;
};

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
};

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

const NAVY = "#071A35";
const GOLD = "#D4AF37";

function formatPrice(
  value: number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value)
  ) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getProductPrice(product: Product): number {
  if (
    product.online_enabled &&
    product.online_price !== null
  ) {
    return Number(product.online_price);
  }

  return Number(product.selling_price ?? 0);
}

function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}: {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
}) {
  const price = getProductPrice(product);

  const isOutOfStock =
    Number(product.stock_quantity ?? 0) <= 0;

  return (
    <article className="group w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* PRODUCT IMAGE
          Mobile  : compact h-40
          Tablet  : h-52
          Desktop : h-56
      */}
      <div className="relative h-40 overflow-hidden bg-slate-50 sm:h-52 lg:h-56">
        <Link
          href={`/products/${product.slug}`}
          className="block h-full w-full"
        >
          {product.primary_image_url ? (
            <Image
              src={product.primary_image_url}
              alt={
                product.product_title ||
                product.name ||
                "Handmade product"
              }
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <Sparkles className="h-10 w-10 text-slate-300" />
            </div>
          )}
        </Link>

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm"
            style={{ backgroundColor: NAVY }}
          >
            Handmade
          </span>

          {product.bulk_orders_available && (
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] shadow-sm"
              style={{
                backgroundColor: GOLD,
                color: NAVY,
              }}
            >
              Bulk
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleWishlist}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition hover:scale-105"
        >
          <Heart
            className={`h-5 w-5 ${
              isWishlisted
                ? "fill-current text-red-500"
                : "text-slate-700"
            }`}
          />
        </button>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="p-4 sm:p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[44px] text-sm font-bold leading-5 text-slate-900 transition group-hover:text-[#071A35] sm:min-h-[48px] sm:leading-6">
            {product.product_title || product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {product.short_description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
          <div>
            <p className="text-lg font-extrabold text-[#071A35]">
              {formatPrice(price)}
            </p>

            {product.online_enabled &&
              product.online_price !== null &&
              product.selling_price !== null &&
              Number(product.online_price) <
                Number(product.selling_price) && (
                <p className="text-xs text-slate-400 line-through">
                  {formatPrice(
                    product.selling_price,
                  )}
                </p>
              )}
          </div>

          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              isOutOfStock
                ? "text-red-500"
                : "text-emerald-600"
            }`}
          >
            {isOutOfStock
              ? "Out of stock"
              : "Available"}
          </span>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={onAddToCart}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:mt-4 sm:py-3"
          style={{
            backgroundColor: isOutOfStock
              ? undefined
              : NAVY,
          }}
        >
          <ShoppingBag className="h-4 w-4" />
          {isOutOfStock
            ? "Unavailable"
            : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: `${GOLD}22`,
          color: NAVY,
        }}
      >
        {icon}
      </div>

      <h3 className="text-base font-extrabold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function CustomCard({
  eyebrow,
  title,
  description,
  href,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-[2rem] p-7 sm:p-9"
      style={{ backgroundColor: NAVY }}
    >
      <div
        className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20"
        style={{ backgroundColor: GOLD }}
      />

      <div
        className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full opacity-10"
        style={{ backgroundColor: GOLD }}
      />

      <div className="relative">
        <p
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: GOLD }}
        >
          {eyebrow}
        </p>

        <h3 className="mt-3 text-2xl font-black text-white sm:text-3xl">
          {title}
        </h3>

        <p className="mt-3 max-w-md text-sm leading-6 text-slate-200">
          {description}
        </p>

        <Link
          href={href}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold transition group-hover:gap-3"
          style={{ color: NAVY }}
        >
          Explore
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

const faqs = [
  {
    question:
      "Do you accept bulk orders for handmade products?",
    answer:
      "Yes. Bulk orders are welcome for selected handmade products. Availability, quantity and pricing depend on the product and your requirements.",
  },
  {
    question:
      "Can I request a customized handmade product?",
    answer:
      "Yes. We accept selected made-to-order and customized requirements. Share your preferred design, colour, quantity or other requirements with us and we can discuss the available options.",
  },
  {
    question:
      "What handmade products do you offer?",
    answer:
      "Our handmade range includes handmade hair accessories such as scrunchies and hair bows, along with selected customized creations.",
  },
  {
    question:
      "Can I order just one handmade product?",
    answer:
      "Yes. Retail orders are welcome, subject to product availability.",
  },
  {
    question:
      "Do you make customized Laddu Gopal Ji products?",
    answer:
      "Yes. Selected Laddu Gopal Ji poshak and accessories can be made to order according to your requirements.",
  },
  {
    question:
      "Can I order customized cushions or cushion covers?",
    answer:
      "Yes. Customized cushions and cushion covers are among the made-to-order options available from Vaishnavi Collections.",
  },
];

export default function HandmadePage() {
  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const shopping = useShopping();

  const [products, setProducts] = useState<Product[]>(
    [],
  );

  const [categories, setCategories] = useState<
    Category[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [openFaq, setOpenFaq] = useState<number | null>(
    0,
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: productData, error: productError } =
        await supabase
          .from("products")
          .select(
            `
              id,
              category_id,
              sku,
              name,
              slug,
              product_title,
              short_description,
              selling_price,
              cost_price,
              stock_quantity,
              online_enabled,
              online_price,
              visibility,
              featured,
              created_at,
              is_handmade,
              is_made_to_order,
              bulk_orders_available,
              handmade_featured
            `,
          )
          .eq("visibility", "PUBLISHED")
          .eq("online_enabled", true)
          .order("created_at", {
            ascending: false,
          });

      if (productError) {
        console.error(
          "Failed to load handmade products:",
          productError,
        );

        setProducts([]);

        setError(
          productError.message ||
            "We couldn't load the handmade collection.",
        );

        return;
      }

      const publishedProducts =
        (productData ?? []) as Omit<
          Product,
          "primary_image_url"
        >[];

      const handmadeProducts =
        publishedProducts.filter(
          (product) =>
            product.is_handmade === true,
        );

      if (handmadeProducts.length === 0) {
        setProducts([]);
        return;
      }

      const productIds =
        handmadeProducts.map(
          (product) => product.id,
        );

      const {
        data: imageData,
        error: imageError,
      } = await supabase
        .from("product_images")
        .select(
          `
            id,
            product_id,
            image_url,
            alt_text,
            sort_order,
            is_primary
          `,
        )
        .in("product_id", productIds)
        .order("sort_order", {
          ascending: true,
        });

      if (imageError) {
        console.error(
          "Failed to load handmade product images:",
          imageError,
        );
      }

      const images =
        (imageData ?? []) as ProductImage[];

      const imageMap =
        new Map<string, ProductImage>();

      for (const image of images) {
        const existing =
          imageMap.get(image.product_id);

        if (!existing) {
          imageMap.set(
            image.product_id,
            image,
          );
          continue;
        }

        if (
          image.is_primary &&
          !existing.is_primary
        ) {
          imageMap.set(
            image.product_id,
            image,
          );
          continue;
        }

        if (
          image.is_primary ===
            existing.is_primary &&
          image.sort_order <
            existing.sort_order
        ) {
          imageMap.set(
            image.product_id,
            image,
          );
        }
      }

      const productsWithImages: Product[] =
        handmadeProducts.map((product) => {
          const image =
            imageMap.get(product.id);

          return {
            ...product,
            primary_image_url:
              image?.image_url ?? null,
          };
        });

      setProducts(productsWithImages);
    } catch (err) {
      console.error(
        "Unexpected handmade page error:",
        err,
      );

      setProducts([]);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading handmade products.",
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("id, name, parent_id")
        .eq("active", true);

      if (error) {
        console.error(
          "Failed to load product categories:",
          error,
        );

        setCategories([]);
        return;
      }

      setCategories(
        (data ?? []) as Category[],
      );
    } catch (err) {
      console.error(
        "Unexpected category loading error:",
        err,
      );

      setCategories([]);
    }
  }, [supabase]);

  useEffect(() => {
    void loadProducts();
    void loadCategories();
  }, [loadProducts, loadCategories]);

  const handmadeHairAccessoryCategoryIds =
    useMemo(() => {
      const hairCategory = categories.find(
        (category) =>
          category.name.trim().toLowerCase() ===
          "hair accessories",
      );

      if (!hairCategory) {
        return new Set<string>();
      }

      return new Set(
        categories
          .filter(
            (category) =>
              category.id === hairCategory.id ||
              category.parent_id ===
                hairCategory.id,
          )
          .map((category) => category.id),
      );
    }, [categories]);

  const hairAccessoryProducts = useMemo(() => {
    if (
      handmadeHairAccessoryCategoryIds.size === 0
    ) {
      return products.slice(0, 4);
    }

    return products.filter((product) =>
      product.category_id
        ? handmadeHairAccessoryCategoryIds.has(
            product.category_id,
          )
        : false,
    );
  }, [
    handmadeHairAccessoryCategoryIds,
    products,
  ]);

  const featuredProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aFeatured =
        a.handmade_featured === true ? 1 : 0;

      const bFeatured =
        b.handmade_featured === true ? 1 : 0;

      if (aFeatured !== bFeatured) {
        return bFeatured - aFeatured;
      }

      const aProductFeatured =
        a.featured === true ? 1 : 0;

      const bProductFeatured =
        b.featured === true ? 1 : 0;

      if (
        aProductFeatured !==
        bProductFeatured
      ) {
        return (
          bProductFeatured -
          aProductFeatured
        );
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
  }, [products]);

  const visibleProducts =
    featuredProducts.slice(0, 8);

  const wishlistIds = useMemo(() => {
    const context = shopping as any;

    const wishlist =
      context?.wishlist ?? [];

    return new Set<string>(
      wishlist
        .map((item: any) =>
          typeof item === "string"
            ? item
            : item?.id || item?.product_id,
        )
        .filter(
          (id: unknown): id is string =>
            typeof id === "string",
        ),
    );
  }, [shopping]);

  const handleToggleWishlist = (
    product: Product,
  ) => {
    const context = shopping as any;

    if (
      typeof context?.toggleWishlist ===
      "function"
    ) {
      context.toggleWishlist(product);
      return;
    }

    if (
      typeof context?.removeFromWishlist ===
        "function" &&
      typeof context?.addToWishlist ===
        "function"
    ) {
      if (wishlistIds.has(product.id)) {
        context.removeFromWishlist(product.id);
      } else {
        context.addToWishlist(product);
      }
    }
  };

  const handleAddToCart = (
    product: Product,
  ) => {
    const context = shopping as any;

    if (
      typeof context?.addToCart ===
      "function"
    ) {
      context.addToCart(product);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: NAVY }}
      >
        <div
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: GOLD }}
        />

        <div
          className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: GOLD }}
        />

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative z-10">
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"
                style={{
                  borderColor: `${GOLD}70`,
                  color: GOLD,
                  backgroundColor: `${GOLD}10`,
                }}
              >
                <Sparkles className="h-4 w-4" />
                Handmade Collection
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-7xl">
                Handmade with Care.
                <span
                  className="block"
                  style={{ color: GOLD }}
                >
                  Made for You.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                Discover thoughtfully made creations
                from Vaishnavi Collections — from
                handmade hair accessories to selected
                customized and made-to-order products.
              </p>

              <p className="mt-4 text-sm font-semibold text-slate-300">
                Retail orders · Bulk orders ·
                Made-to-order options
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#handmade-products"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-extrabold transition hover:scale-[1.02]"
                  style={{
                    backgroundColor: GOLD,
                    color: NAVY,
                  }}
                >
                  Shop Handmade
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#custom-orders"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Custom / Bulk Enquiry
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="relative mx-auto max-w-md">
                <div
                  className="absolute -inset-4 rounded-[2.5rem] opacity-20 blur-2xl"
                  style={{ backgroundColor: GOLD }}
                />

                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex aspect-square items-center justify-center rounded-[2rem] bg-white/10">
                      <Sparkles
                        className="h-16 w-16"
                        style={{ color: GOLD }}
                      />
                    </div>

                    <div className="flex aspect-square items-center justify-center rounded-[2rem] bg-white/5">
                      <Heart className="h-16 w-16 text-white" />
                    </div>

                    <div
                      className="col-span-2 rounded-[2rem] p-6"
                      style={{
                        backgroundColor: `${GOLD}16`,
                      }}
                    >
                      <p
                        className="text-xs font-bold uppercase tracking-[0.2em]"
                        style={{ color: GOLD }}
                      >
                        Vaishnavi Collections
                      </p>

                      <p className="mt-2 text-2xl font-black text-white">
                        Small details.
                        <br />
                        Special feeling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                icon: (
                  <Heart className="h-4 w-4" />
                ),
                text: "Made with care",
              },
              {
                icon: (
                  <Users className="h-4 w-4" />
                ),
                text: "Retail & bulk orders",
              },
              {
                icon: (
                  <Sparkles className="h-4 w-4" />
                ),
                text: "Custom options",
              },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"
              >
                <span style={{ color: GOLD }}>
                  {item.icon}
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8 lg:py-20">
        <span
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: GOLD }}
        >
          Made by hand, chosen by you
        </span>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#071A35] sm:text-4xl">
          Little details make things feel special.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          Explore our handmade creations for
          everyday use, gifting, festive occasions and
          special requirements. Looking for something
          different? Ask us about selected
          made-to-order options.
        </p>
      </section>

      {/* PRODUCTS */}
      <section
        id="handmade-products"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24"
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              Shop the collection
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#071A35]">
              Our Handmade Collection
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Explore handmade products currently
              available online. Products remain in their
              original shop categories while also being
              showcased here.
            </p>
          </div>

          {products.length > 8 && (
            <span className="text-sm font-semibold text-slate-500">
              Showing {visibleProducts.length} of{" "}
              {products.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-[#071A35]" />

              <span className="text-sm font-medium">
                Loading handmade products...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Sparkles className="h-6 w-6 text-red-500" />
            </div>

            <h3 className="mt-4 text-xl font-bold text-[#071A35]">
              We couldn't load the handmade collection
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Please refresh the page and try again.
              If the problem continues, the technical
              error below will help us identify it.
            </p>

            <details className="mx-auto mt-5 max-w-xl text-left">
              <summary className="cursor-pointer text-xs font-bold text-slate-500">
                Technical details
              </summary>

              <p className="mt-2 break-words rounded-xl bg-slate-100 p-3 font-mono text-xs text-red-600">
                {error}
              </p>
            </details>

            <button
              type="button"
              onClick={() => void loadProducts()}
              className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
              style={{
                backgroundColor: NAVY,
              }}
            >
              Try Again
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-slate-300" />

            <h3 className="mt-4 text-xl font-bold text-[#071A35]">
              Our handmade collection is growing
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              We're preparing more handmade creations
              for our online collection. Check back soon
              or contact us for custom requirements.
            </p>

            <a
              href="#custom-orders"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
              style={{
                backgroundColor: NAVY,
              }}
            >
              Ask About Custom Orders
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          /*
           * Responsive product layout:
           *
           * Mobile:
           *   1 full-width card per row
           *
           * Tablet:
           *   2 cards per row
           *
           * Desktop:
           *   Fixed-width cards centered as a group.
           *   They do not stretch across the whole row.
           */
          <div className="flex w-full flex-col items-center gap-4 sm:grid sm:grid-cols-2 sm:justify-items-center sm:gap-5 lg:flex lg:flex-row lg:flex-wrap lg:justify-center lg:gap-5">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="w-full sm:w-full lg:w-[260px] xl:w-[280px]"
              >
                <ProductCard
                  product={product}
                  isWishlisted={wishlistIds.has(
                    product.id,
                  )}
                  onToggleWishlist={() =>
                    handleToggleWishlist(product)
                  }
                  onAddToCart={() =>
                    handleAddToCart(product)
                  }
                />
              </div>
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          products.length > 8 && (
            <div className="mt-8 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-[#071A35] transition hover:border-[#071A35] hover:shadow-md"
              >
                Explore More Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
      </section>

      {/* CUSTOM / MADE TO ORDER */}
      <section
        id="custom-orders"
        className="scroll-mt-24 border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              Made to order
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#071A35] sm:text-4xl">
              Have something specific in mind?
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Some creations are better when they're
              made especially for you. Share your
              requirements with Vaishnavi Collections
              and we'll discuss the available options.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <CustomCard
              eyebrow="Laddu Gopal Ji"
              title="Poshak & Accessories"
              description="Ask about selected customized Laddu Gopal Ji poshak and accessories made according to your requirements."
              href="/collections/laddu-gopal"
            />

            <CustomCard
              eyebrow="Home"
              title="Cushions & Covers"
              description="Customized cushions and cushion covers for personal, gifting and special requirements."
              href="/collections/home-furnishing"
            />

            <CustomCard
              eyebrow="Handmade"
              title="Hair Accessories"
              description="Handmade scrunchies, bows and selected hair accessories can be discussed for custom requirements."
              href="/collections/hair-accessories"
            />
          </div>
        </div>
      </section>

      {/* RETAIL / BULK */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              Orders that fit your need
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#071A35] sm:text-4xl">
              One piece or a larger quantity?
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Whether you're shopping for yourself,
              choosing a gift or looking for a larger
              quantity, we're happy to discuss your
              requirement.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={<Heart className="h-6 w-6" />}
              title="Retail Orders"
              description="Order individual handmade products for personal use, gifting and special occasions."
            />

            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Bulk Orders"
              description="Planning an event, gifting or a larger requirement? Ask us about bulk availability and pricing."
            />

            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Custom Options"
              description="Share your preferred colour, design, quantity or other requirements for selected made-to-order products."
            />

            <FeatureCard
              icon={<Truck className="h-6 w-6" />}
              title="Pan-India Shopping"
              description="Available online products can be ordered for delivery across India, subject to our shipping terms."
            />
          </div>
        </div>
      </section>

      {/* HANDMADE HAIR ACCESSORIES */}
      {hairAccessoryProducts.length > 0 && (
        <section className="bg-[#071A35]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: GOLD }}
                >
                  A handmade favourite
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  Handmade Hair Accessories
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  Discover handmade scrunchies and
                  hair accessories created to add a
                  little something extra to your
                  everyday look.
                </p>
              </div>

              <Link
                href="/collections/hair-accessories"
                className="inline-flex items-center gap-2 text-sm font-bold"
                style={{ color: GOLD }}
              >
                Explore Hair Accessories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Same responsive behavior as main collection:
                Mobile  = 1 full-width
                Tablet  = 2 columns
                Desktop = centered fixed-width cards
            */}
            <div className="mt-8 flex w-full flex-col items-center gap-4 sm:grid sm:grid-cols-2 sm:justify-items-center sm:gap-5 lg:flex lg:flex-row lg:flex-wrap lg:justify-center lg:gap-5">
              {hairAccessoryProducts
                .slice(0, 4)
                .map((product) => (
                  <div
                    key={`hair-${product.id}`}
                    className="w-full sm:w-full lg:w-[260px] xl:w-[280px]"
                  >
                    <ProductCard
                      product={product}
                      isWishlisted={wishlistIds.has(
                        product.id,
                      )}
                      onToggleWishlist={() =>
                        handleToggleWishlist(product)
                      }
                      onAddToCart={() =>
                        handleAddToCart(product)
                      }
                    />
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] px-6 py-12 text-center sm:px-12 sm:py-16"
          style={{ backgroundColor: NAVY }}
        >
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: GOLD }}
          />

          <div
            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: GOLD }}
          />

          <div className="relative">
            <Sparkles
              className="mx-auto h-9 w-9"
              style={{ color: GOLD }}
            />

            <h2 className="mt-5 text-3xl font-black text-white sm:text-4xl">
              Looking for something custom?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Tell us what you have in mind — product,
              colour, design, quantity or customization.
              We'll help you understand the available
              options.
            </p>

            <a
              href="mailto:vaishnavicollections@gmail.com?subject=Handmade%20%2F%20Custom%20Order%20Enquiry"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-extrabold transition hover:scale-[1.02]"
              style={{
                backgroundColor: GOLD,
                color: NAVY,
              }}
            >
              Send Your Requirement
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="text-center">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              Questions
            </p>

            <h2 className="mt-2 text-3xl font-black text-[#071A35]">
              Frequently Asked Questions
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              A few quick answers about handmade,
              customized and bulk orders.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen =
                openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(
                        isOpen ? null : index,
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-bold leading-6 text-[#071A35]">
                      {faq.question}
                    </span>

                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${
                        isOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-200 px-5 pb-5 pt-4">
                      <p className="text-sm leading-7 text-slate-600">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}