"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Heart,
  Loader2,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useShopping } from "@/context/ShoppingContext";

type WishlistProduct = {
  id: string;
  name: string;
  slug: string;
  product_title: string | null;
  selling_price: number;
  online_price: number | null;
  online_enabled: boolean;
  stock_quantity: number;
};

type ProductImage = {
  product_id: string;
  image_url: string;
  is_primary: boolean;
};

type WishlistProductItem = WishlistProduct & {
  primaryImage: string | null;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getProductPrice(product: WishlistProduct) {
  if (
    product.online_enabled &&
    product.online_price !== null
  ) {
    return Number(product.online_price);
  }

  return Number(product.selling_price);
}

export default function WishlistPage() {
  const {
    wishlistItems,
    cartItems,
    toggleWishlist,
    addToCart,
    loading: shoppingLoading,
  } = useShopping();

  const [products, setProducts] = useState<
    WishlistProductItem[]
  >([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [actionId, setActionId] = useState<string | null>(
    null,
  );

  const supabase = useMemo(() => createClient(), []);

  /*
   * Load wishlist products and their images.
   */
  useEffect(() => {
    async function loadProducts() {
      if (wishlistItems.length === 0) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);

      try {
        const productIds = wishlistItems.map(
          (item) => item.product_id,
        );

        /*
         * Load products
         */
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
              selling_price,
              online_price,
              online_enabled,
              stock_quantity
            `,
          )
          .in("id", productIds);

        if (productError) {
          console.error(
            "Failed to load wishlist products:",
            productError,
          );

          setProducts([]);
          return;
        }

        /*
         * Load product images
         */
        const {
          data: imageData,
          error: imageError,
        } = await supabase
          .from("product_images")
          .select(
            `
              product_id,
              image_url,
              is_primary
            `,
          )
          .in("product_id", productIds);

        if (imageError) {
          console.error(
            "Failed to load wishlist images:",
            imageError,
          );

          setProducts([]);
          return;
        }

        const images =
          (imageData ?? []) as ProductImage[];

        /*
         * Prefer primary image.
         * If there isn't one, use the first image.
         */
        const imageMap = new Map<string, string>();

        for (const image of images) {
          if (
            image.is_primary ||
            !imageMap.has(image.product_id)
          ) {
            imageMap.set(
              image.product_id,
              image.image_url,
            );
          }
        }

        const productsWithImages: WishlistProductItem[] =
          (productData ?? []).map((product) => ({
            ...(product as WishlistProduct),
            primaryImage:
              imageMap.get(product.id) ?? null,
          }));

        /*
         * Preserve wishlist order.
         */
        const productMap = new Map(
          productsWithImages.map((product) => [
            product.id,
            product,
          ]),
        );

        const orderedProducts = wishlistItems
          .map((item) =>
            productMap.get(item.product_id),
          )
          .filter(
            (
              product,
            ): product is WishlistProductItem =>
              Boolean(product),
          );

        setProducts(orderedProducts);
      } catch (error) {
        console.error(
          "Failed to load wishlist products:",
          error,
        );

        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, [wishlistItems, supabase]);

  /*
   * Check whether a product is already in cart.
   */
  const cartProductIds = useMemo(() => {
    return new Set(
      cartItems.map((item) => item.product_id),
    );
  }, [cartItems]);

  /*
   * Remove product from wishlist.
   */
  const handleRemove = async (productId: string) => {
    if (actionId) return;

    setActionId(productId);

    try {
      await toggleWishlist(productId);
    } catch (error) {
      console.error(
        "Failed to remove wishlist item:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to remove this item.";

      alert(message);
    } finally {
      setActionId(null);
    }
  };

  /*
   * Add product to cart.
   */
  const handleAddToCart = async (
    product: WishlistProductItem,
  ) => {
    if (
      actionId ||
      product.stock_quantity <= 0 ||
      cartProductIds.has(product.id)
    ) {
      return;
    }

    setActionId(product.id);

    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error(
        "Failed to add wishlist product to cart:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to add this product to your cart.";

      alert(message);
    } finally {
      setActionId(null);
    }
  };

  const isLoading =
    shoppingLoading || loadingProducts;

  /*
   * Loading state
   */
  if (isLoading) {
    return (
      <main className="min-h-[70vh] bg-[#faf9f6]">
        <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#b08d2c]" />

            <p className="text-sm text-slate-500">
              Loading your wishlist...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Empty wishlist
   */
  if (wishlistItems.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#faf9f6]">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-4 py-12">
          <div className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f7f1df]">
              <Heart className="h-9 w-9 text-[#b08d2c]" />
            </div>

            <h1 className="font-serif text-2xl font-semibold text-[#0b1f3a] sm:text-3xl">
              Your Wishlist is Empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Save the products you love here and
              come back to them whenever you like.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b1f3a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#132c50]"
            >
              Explore Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Wishlist
   */
  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0b1f3a]"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Continue Shopping
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b08d2c]">
                Vaishnavi Collections
              </p>

              <h1 className="font-serif text-3xl font-semibold text-[#0b1f3a] sm:text-4xl">
                My Wishlist
              </h1>
            </div>

            <p className="text-sm text-slate-500">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1
                ? "item"
                : "items"}
            </p>
          </div>
        </div>

        {/* Products */}
     <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4 sm:gap-5">
  {products.map((product) => {
    const title =
      product.product_title?.trim() ||
      product.name;

    const price = getProductPrice(product);

    const outOfStock =
      product.stock_quantity <= 0;

    const alreadyInCart =
      cartProductIds.has(product.id);

    const isActioning =
      actionId === product.id;

    return (
      <article
        key={product.id}
        className="group w-[calc(50%-8px)] max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)]"
      >
        {/* Image */}
        <div className="relative aspect-[1/1.08] overflow-hidden bg-slate-100">
          <Link
            href={`/products/${product.slug}`}
            className="block h-full w-full"
          >
            {product.primaryImage ? (
              <Image
                src={product.primaryImage}
                alt={title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-slate-300" />
              </div>
            )}
          </Link>

          {/* Wishlist remove */}
          <button
            type="button"
            onClick={() => handleRemove(product.id)}
            disabled={Boolean(actionId)}
            aria-label={`Remove ${title} from wishlist`}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#b08d2c] shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-50"
          >
            {isActioning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4 fill-current" />
            )}
          </button>

          {/* Stock badge */}
          {outOfStock && (
            <div className="absolute bottom-3 left-3 rounded-full bg-slate-900/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              Out of Stock
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-3 sm:p-4">
          <Link
            href={`/products/${product.slug}`}
            className="block"
          >
            <h2 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-[#0b1f3a] transition hover:text-[#b08d2c]">
              {title}
            </h2>

            <p className="mt-2 text-base font-bold text-[#0b1f3a]">
              {formatPrice(price)}
            </p>
          </Link>

          {/* Add to Bag */}
          <button
            type="button"
            onClick={() => handleAddToCart(product)}
            disabled={
              outOfStock ||
              alreadyInCart ||
              Boolean(actionId)
            }
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              outOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : alreadyInCart
                  ? "cursor-not-allowed bg-[#f7f1df] text-[#b08d2c]"
                  : "bg-[#0b1f3a] text-white hover:bg-[#132c50]"
            }`}
          >
            {isActioning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : outOfStock ? (
              "Out of Stock"
            ) : alreadyInCart ? (
              <>
                <ShoppingBag className="h-4 w-4" />
                Added to Bag
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                Add to Bag
              </>
            )}
          </button>

          {/* Remove */}
          <button
            type="button"
            onClick={() => handleRemove(product.id)}
            disabled={Boolean(actionId)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-400 transition hover:text-red-500 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </article>
    );
  })}
</div>
      </div>
    </main>
  );
}