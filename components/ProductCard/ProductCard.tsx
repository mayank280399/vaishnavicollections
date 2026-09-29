"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";

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
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Customer-facing title.
  // Falls back to internal product name for older products.
  const displayTitle = product.product_title?.trim() || product.name;

  const hasDiscount =
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price;

  const discount = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) /
          product.originalPrice!) *
          100,
      )
    : null;

  const isOutOfStock =
    typeof product.stockQuantity === "number" &&
    product.stockQuantity <= 0;

  const handleCart = () => {
    if (isOutOfStock) return;

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 1800);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
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
        {/* Image */}
        <div className="relative aspect-[1.2] overflow-hidden bg-[#f4f0e9] sm:aspect-[1.25]">
          <img
            src={product.image}
            alt={displayTitle}
            loading={index < 4 ? "eager" : "lazy"}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              isOutOfStock ? "opacity-70" : ""
            }`}
          />

          {/* Badge */}
          {(discount || product.badge || isOutOfStock) && (
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
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setWishlisted((value) => !value);
            }}
            aria-label={
              wishlisted
                ? `Remove ${displayTitle} from wishlist`
                : `Add ${displayTitle} to wishlist`
            }
            className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/95 shadow-sm transition hover:bg-white sm:right-3 sm:top-3 ${
              wishlisted ? "text-rose-500" : "text-[#10233e]"
            }`}
          >
            <Heart
              size={15}
              fill={wishlisted ? "currentColor" : "none"}
            />
          </button>

          {/* Desktop Add to Bag */}
          {!isOutOfStock && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleCart();
              }}
              className="absolute inset-x-0 bottom-0 hidden translate-y-2 items-center justify-center gap-2 bg-[#10233e]/95 py-2.5 text-xs font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex"
            >
              <ShoppingBag size={14} />
              {addedToCart ? "Added!" : "Add to Bag"}
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
                ₹{formatPrice(product.price)}
              </span>

              {hasDiscount && (
                <span className="text-[10px] text-slate-400 line-through">
                  ₹{formatPrice(product.originalPrice!)}
                </span>
              )}
            </div>

            <span className="shrink-0 text-[10px] font-medium text-[#b18425]">
              View item
            </span>
          </div>
        </div>
      </Link>

      {/* Mobile Add to Bag */}
      {!isOutOfStock && (
        <div className="px-3 pb-3 sm:hidden">
          <button
            type="button"
            onClick={handleCart}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#10233e] py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#1b3558]"
          >
            <ShoppingBag size={13} />
            {addedToCart ? "Added!" : "Add to Bag"}
          </button>
        </div>
      )}

      {/* Out of Stock Mobile State */}
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