"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useState } from "react";

import { useShopping } from "@/context/ShoppingContext";

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  product_title?: string | null;
  image: string;
  price: number;
  originalPrice?: number | null;
  category?: string | null;
  badge?: string | null;
  stockQuantity?: number | null;
}

interface ProductCardProps {
  product: StorefrontProduct;
  index?: number;
  inView?: boolean;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductCard({
  product,
  index = 0,
  inView = true,
}: ProductCardProps) {
  const {
    addToCart,
    cartItems,
    toggleWishlist,
    isFavorite,
  } = useShopping();

  const [cartLoading, setCartLoading] =
    useState(false);

  const [addedToCart, setAddedToCart] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  // ---------------------------------------------------------
  // PRODUCT DISPLAY DATA
  // ---------------------------------------------------------

  
  const displayTitle =  product.product_title?.trim() ||
    product.name;

  const wishlisted = isFavorite(product.id);

  const cartItem = cartItems.find(
    (item) => item.product_id === product.id,
  );

  const isInCart = Boolean(cartItem);

  const hasDiscount =
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price;

  const discount = hasDiscount
    ? Math.round(
        ((product.originalPrice! -
          product.price) /
          product.originalPrice!) *
          100,
      )
    : null;

  const isOutOfStock =
    typeof product.stockQuantity ===
      "number" &&
    product.stockQuantity <= 0;

  // ---------------------------------------------------------
  // ADD TO CART
  // ---------------------------------------------------------

  const handleCart = async (
    event?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (
      isOutOfStock ||
      cartLoading ||
      isInCart
    ) {
      return;
    }

    setCartLoading(true);

    try {
      await addToCart(product.id, 1);

      setAddedToCart(true);
    } catch (error) {
      console.error(
        "Failed to add product to cart:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to add this product to your cart.";

      alert(message);
    } finally {
      setCartLoading(false);
    }
  };

  // ---------------------------------------------------------
  // WISHLIST
  // ---------------------------------------------------------

  const handleWishlist = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (wishlistLoading) {
      return;
    }

    setWishlistLoading(true);

    try {
      await toggleWishlist(product.id);
    } catch (error) {
      console.error(
        "Failed to update wishlist:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to update your wishlist.";

      alert(message);
    } finally {
      setWishlistLoading(false);
    }
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
            }
          : {}
      }
      transition={{
        duration: 0.45,
        delay: index * 0.05,
      }}
      className="group relative h-full overflow-hidden rounded-xl border border-[#ece8e0] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Product Link */}

      <Link
        href={`/products/${product.slug}`}
        className="block"
        aria-label={`View ${displayTitle}`}
      >
        {/* Product Image */}

        <div className="relative aspect-[1.2] overflow-hidden bg-[#f4f0e9] sm:aspect-[1.25]">
          <img
            src={product.image} alt={displayTitle}
            loading={ index < 4 ? "eager" : "lazy"}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              isOutOfStock ? "opacity-70": ""
            }`}
          />

          {/* Badge */}

          {(discount ||
            product.badge ||
            isOutOfStock) && (
            <div className="absolute left-2 top-2 flex flex-col gap-1.5 sm:left-3 sm:top-3">
              {isOutOfStock ? (
                <span className="rounded bg-slate-700 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
                  Out of Stock
                </span>
              ) : discount ? (
                <span className="rounded bg-[#b18425] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
                  -{discount}%
                </span>
              ) : product.badge ? (
                <span
                  className={`rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white ${
                    product.badge === "New"
                      ? "bg-[#10233e]"
                      : "bg-[#b18425]"
                  }`}
                >
                  {product.badge}
                </span>
              ) : null}
            </div>
          )}

          {/* Wishlist */}

          <button
            type="button"
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label={
              wishlisted
                ? `Remove ${displayTitle} from wishlist`
                : `Add ${displayTitle} to wishlist`
            }
            className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/95 shadow-sm transition hover:bg-white disabled:cursor-not-allowed sm:right-3 sm:top-3 ${
              wishlisted
                ? "text-rose-500"
                : "text-[#10233e]"
            }`}
          >
            {wishlistLoading ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Heart
                size={15}
                fill={
                  wishlisted
                    ? "currentColor"
                    : "none"
                }
              />
            )}
          </button>

          {/* Desktop Add to Bag */}

          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleCart}
              disabled={
                cartLoading || isInCart
              }
              className={`absolute inset-x-0 bottom-0 hidden translate-y-2 items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-default sm:flex ${
                isInCart
                  ? "bg-[#b18425]/95"
                  : "bg-[#10233e]/95"
              }`}
            >
              {cartLoading ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <ShoppingBag size={14} />
              )}

              {cartLoading
                ? "Adding..."
                : isInCart
                  ? "✓ Added to Bag"
                  : "Add to Bag"}
            </button>
          )}
        </div>

        {/* Product Information */}

        <div className="p-3 sm:p-4">
          {/* Category */}

          {product.category && (
            <div className="mb-1.5">
              <span className="truncate text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                {product.category}
              </span>
            </div>
          )}

          {/* Customer-Facing Product Title */}

          <h3 className="line-clamp-2 min-h-8 text-xs font-semibold leading-4 text-[#10233e] sm:text-sm">
            {displayTitle}
          </h3>

          {/* Price */}

          <div className="mt-2 flex items-end justify-between gap-2 border-t border-[#f0ede7] pt-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-bold text-[#10233e] sm:text-base">
                ₹
                {formatPrice(
                  product.price,
                )}
              </span>

              {hasDiscount && (
                <span className="text-[10px] text-slate-400 line-through">
                  ₹
                  {formatPrice(
                    product.originalPrice!,
                  )}
                </span>
              )}
            </div>

            {/* Desktop / Mobile View Item */}

            <span className="shrink-0 text-[10px] font-medium text-[#b18425]">
              View item
            </span>
          </div>
        </div>
      </Link>

      {/* -----------------------------------------------------
          Mobile Quick Add
          Compact icon-only control
         ----------------------------------------------------- */}

      {!isOutOfStock && (
        <div className="flex items-center justify-end px-3 pb-3 sm:hidden">
          <button
            type="button"
            onClick={handleCart}
            disabled={
              cartLoading || isInCart
            }
            aria-label={
              cartLoading
                ? `Adding ${displayTitle} to bag`
                : isInCart
                  ? `${displayTitle} is already in your bag`
                  : `Add ${displayTitle} to bag`
            }
            title={
              isInCart
                ? "Added to Bag"
                : "Add to Bag"
            }
            className={`grid size-10 place-items-center rounded-full text-white shadow-sm transition duration-200 active:scale-95 disabled:cursor-default ${
              isInCart
                ? "bg-[#b18425]"
                : "bg-[#10233e] hover:bg-[#1b3558]"
            }`}
          >
            {cartLoading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : isInCart ? (
              <span
                className="text-base font-bold leading-none"
                aria-hidden="true"
              >
                ✓
              </span>
            ) : (
              <ShoppingBag
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      )}

      {/* -----------------------------------------------------
          Out of Stock Mobile State
         ----------------------------------------------------- */}

      {isOutOfStock && (
        <div className="px-3 pb-3 sm:hidden">
          <div className="flex w-full items-center justify-center rounded-lg bg-slate-100 py-2.5 text-[11px] font-semibold text-slate-500">
            Currently Unavailable
          </div>
        </div>
      )}
    </motion.article>
  );
}