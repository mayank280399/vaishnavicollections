"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/data";

interface ProductCardProps {
  product: Product;
  index?: number;
  inView?: boolean;
}

export default function ProductCard({ product, index = 0, inView = true }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="group relative h-full overflow-hidden rounded-xl border border-[#ece8e0] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[1.2] overflow-hidden bg-[#f4f0e9] sm:aspect-[1.25]">
          <img src={product.image} alt={product.name} loading={index < 4 ? "eager" : "lazy"} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          {product.badge && (
            <span className={`absolute left-2 top-2 rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white sm:left-3 sm:top-3 ${product.badge === "Sale" ? "bg-[#d0a83f]" : product.badge === "New" ? "bg-[#10233e]" : "bg-[#b18425]"}`}>
              {product.badge === "Sale" && discount ? `-${discount}%` : product.badge}
            </span>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[9px] font-semibold uppercase tracking-wider text-slate-500">{product.category}</span>
            <span className="flex shrink-0 items-center gap-1 text-[10px] text-[#10233e]"><Star size={11} fill="#e2b657" stroke="none" /> {product.rating} <span className="text-slate-400">({product.reviewCount})</span></span>
          </div>
          <h3 className="mt-1.5 line-clamp-2 min-h-8 text-xs font-semibold leading-4 text-[#10233e] sm:text-sm">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between border-t border-[#f0ede7] pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-[#10233e] sm:text-base">₹{product.price}</span>
              {product.originalPrice && <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</span>}
            </div>
            <span className="text-[10px] font-medium text-[#b18425]">View item</span>
          </div>
        </div>
      </Link>
      <button type="button" onClick={() => setWishlisted((value) => !value)} aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"} className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/95 shadow-sm transition hover:bg-white sm:right-3 sm:top-3 ${wishlisted ? "text-rose-500" : "text-[#10233e]"}`}>
        <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
      </button>
      <button type="button" onClick={handleCart} className="absolute inset-x-0 bottom-[5.1rem] hidden translate-y-2 items-center justify-center gap-2 bg-[#10233e]/90 py-2.5 text-xs font-semibold text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
        <ShoppingBag size={14} /> {addedToCart ? "Added!" : "Add to bag"}
      </button>
    </motion.article>
  );
}
