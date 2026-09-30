"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Loader2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useShopping } from "@/context/ShoppingContext";

type CartProduct = {
  id: string;
  name: string;
  slug: string;
  product_title: string | null;
  selling_price: number;
  online_price: number | null;
  online_enabled: boolean;
  stock_quantity: number;
  primaryImage: string | null;
};

type ProductImage = {
  product_id: string;
  image_url: string;
  is_primary: boolean;
};

type CartProductItem = CartProduct & {
  quantity: number;
  cartItemId: string;
};
function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getProductPrice(product: CartProduct) {
  if (
    product.online_enabled &&
    product.online_price !== null
  ) {
    return Number(product.online_price);
  }

  return Number(product.selling_price);
}

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeCartItem,
    loading: shoppingLoading,
  } = useShopping();

  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  /*
   * Load the actual products belonging to the user's cart.
   */
  useEffect(() => {
   async function loadProducts() {
  if (cartItems.length === 0) {
    setProducts([]);
    setLoadingProducts(false);
    return;
  }

  setLoadingProducts(true);

  try {
    const productIds = cartItems.map(
      (item) => item.product_id,
    );

    // Load products
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
        "Failed to load cart products:",
        productError,
      );

      setProducts([]);
      return;
    }

    // Load product images
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
        "Failed to load product images:",
        imageError,
      );

      setProducts([]);
      return;
    }

    const images =
      (imageData ?? []) as ProductImage[];

    const imageMap = new Map<string, string>();

    for (const image of images) {
      // Prefer the primary image
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

    const productsWithImages: CartProduct[] =
      (productData ?? []).map((product) => ({
        ...(product as CartProduct),
        primaryImage:
          imageMap.get(product.id) ?? null,
      }));

    setProducts(productsWithImages as CartProduct[]);
  } catch (error) {
    console.error(
      "Failed to load cart products:",
      error,
    );

    setProducts([]);
  } finally {
    setLoadingProducts(false);
  }
}
    loadProducts();
  }, [cartItems, supabase]);

  /*
   * Combine cart rows with their products.
   */
  const cartProductItems = useMemo<CartProductItem[]>(() => {
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    return cartItems
      .map((cartItem) => {
        const product = productMap.get(cartItem.product_id);

        if (!product) {
          return null;
        }

        return {
          ...product,
          quantity: cartItem.quantity,
          cartItemId: cartItem.id,
        };
      })
      .filter(
        (item): item is CartProductItem => item !== null,
      );
  }, [cartItems, products]);

  const subtotal = useMemo(() => {
    return cartProductItems.reduce((total, item) => {
      return (
        total +
        getProductPrice(item) * item.quantity
      );
    }, 0);
  }, [cartProductItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
  }, [cartItems]);

  const handleQuantityChange = async (
    item: CartProductItem,
    newQuantity: number,
  ) => {
    if (updatingId || removingId) return;

    if (newQuantity <= 0) {
      setRemovingId(item.cartItemId);

      try {
        await removeCartItem(item.cartItemId);
      } catch (error) {
        console.error(
          "Failed to remove cart item:",
          error,
        );
        alert("Unable to remove this item.");
      } finally {
        setRemovingId(null);
      }

      return;
    }

    const maxStock = Number(item.stock_quantity);

    if (maxStock <= 0) {
      return;
    }

    const safeQuantity = Math.min(
      newQuantity,
      maxStock,
    );

    if (safeQuantity === item.quantity) {
      return;
    }

    setUpdatingId(item.cartItemId);

    try {
      await updateQuantity(
        item.cartItemId,
        safeQuantity,
      );
    } catch (error) {
      console.error(
        "Failed to update cart quantity:",
        error,
      );
      alert("Unable to update quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (
    cartItemId: string,
  ) => {
    if (removingId || updatingId) return;

    setRemovingId(cartItemId);

    try {
      await removeCartItem(cartItemId);
    } catch (error) {
      console.error(
        "Failed to remove cart item:",
        error,
      );
      alert("Unable to remove this item.");
    } finally {
      setRemovingId(null);
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
              Loading your cart...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Empty cart
   */
  if (cartItems.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#faf9f6]">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-4 py-12">
          <div className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f7f1df]">
              <ShoppingBag className="h-9 w-9 text-[#b08d2c]" />
            </div>

            <h1 className="font-serif text-2xl font-semibold text-[#0b1f3a] sm:text-3xl">
              Your Cart is Empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Looks like you haven't added anything to
              your cart yet. Explore our collections and
              find something you love.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b1f3a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#132c50]"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Main cart
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
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b08d2c]">
                Vaishnavi Collections
              </p>

              <h1 className="font-serif text-3xl font-semibold text-[#0b1f3a] sm:text-4xl">
                Shopping Cart
              </h1>
            </div>

            <p className="text-sm text-slate-500">
              {totalItems}{" "}
              {totalItems === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Cart items */}
          <section className="space-y-4">
            {cartProductItems.map((item) => {
              const price = getProductPrice(item);
              const itemTotal = price * item.quantity;

              const isUpdating =
                updatingId === item.cartItemId;

              const isRemoving =
                removingId === item.cartItemId;

              const stock = Number(
                item.stock_quantity,
              );

              const maxReached =
                stock > 0 &&
                item.quantity >= stock;

              const title =
                item.product_title?.trim() ||
                item.name;

              return (
                <article
                  key={item.cartItemId}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
                    {/* Image */}
                    <Link
                      href={`/products/${item.slug}`}
                      className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-32"
                    >
                      {item.primaryImage  ? (
                        <Image
                          src={item.primaryImage }
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 96px, 128px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-7 w-7 text-slate-300" />
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            className="line-clamp-2 text-sm font-semibold text-[#0b1f3a] transition hover:text-[#b08d2c] sm:text-base"
                          >
                            {title}
                          </Link>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {formatPrice(price)}
                          </p>
                        </div>

                        {/* Desktop remove */}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(
                              item.cartItemId,
                            )
                          }
                          disabled={
                            isRemoving ||
                            isUpdating
                          }
                          className="hidden shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:block"
                          aria-label={`Remove ${title}`}
                        >
                          {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Quantity + total */}
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex h-9 items-center overflow-hidden rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(
                                  item,
                                  item.quantity - 1,
                                )
                              }
                              disabled={
                                isUpdating ||
                                isRemoving
                              }
                              className="flex h-full w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <div className="flex h-full min-w-10 items-center justify-center border-x border-slate-200 px-2 text-sm font-semibold text-[#0b1f3a]">
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin text-[#b08d2c]" />
                              ) : (
                                item.quantity
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleQuantityChange(
                                  item,
                                  item.quantity + 1,
                                )
                              }
                              disabled={
                                isUpdating ||
                                isRemoving ||
                                maxReached
                              }
                              className="flex h-full w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {stock > 0 && (
                            <p className="mt-1.5 text-[11px] text-slate-400">
                              {stock}{" "}
                              {stock === 1
                                ? "available"
                                : "available"}
                            </p>
                          )}
                        </div>

                        <p className="text-sm font-bold text-[#0b1f3a] sm:text-base">
                          {formatPrice(itemTotal)}
                        </p>
                      </div>

                      {/* Mobile remove */}
                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(
                            item.cartItemId,
                          )
                        }
                        disabled={
                          isRemoving ||
                          isUpdating
                        }
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-red-500 disabled:opacity-50 sm:hidden"
                      >
                        {isRemoving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-serif text-xl font-semibold text-[#0b1f3a]">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3 border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Items
                  </span>
                  <span className="font-medium text-slate-700">
                    {totalItems}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Shipping
                  </span>
                  <span className="font-medium text-slate-600">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-5">
                <span className="text-base font-semibold text-[#0b1f3a]">
                  Total
                </span>

                <span className="text-xl font-bold text-[#0b1f3a]">
                  {formatPrice(subtotal)}
                </span>
              </div>
<Link
  href="/checkout"
  className="flex w-full items-center justify-center rounded-2xl bg-[#0f1f3d] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#172b52]"
>
  Proceed to Checkout
</Link>
              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                Checkout and payment will be enabled
                in the next phase.
              </p>

              <div className="mt-5 rounded-xl bg-[#f8f4e8] p-4">
                <p className="text-xs font-semibold text-[#0b1f3a]">
                  Secure shopping
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Your cart is securely linked to your
                  account and saved for your next visit.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}