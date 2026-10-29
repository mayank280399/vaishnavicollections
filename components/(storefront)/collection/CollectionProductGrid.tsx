"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import ProductCard, {
  type StorefrontProduct,
} from "@/components/ProductCard/ProductCard";

export type CollectionProduct = StorefrontProduct;

interface CollectionProductGridProps {
  products: CollectionProduct[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function CollectionProductGrid({
  products,
  emptyTitle = "Products coming soon",
  emptyDescription = "We are adding products to this collection. Please check back soon.",
}: CollectionProductGridProps) {
  const [selectedSize, setSelectedSize] = useState("ALL");
  const sizes = useMemo(() => Array.from(new Set(products.map((product) => product.size?.trim()).filter((size): size is string => Boolean(size)))).sort((a, b) => a.localeCompare(b)), [products]);
  const filteredProducts = selectedSize === "ALL" ? products : products.filter((product) => product.size?.trim().toLowerCase() === selectedSize.toLowerCase());

  if (!products.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-[#1B263B]/10 bg-white px-6 text-center"
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#C88A3D]/10 text-[#C88A3D]">
          <Search size={28} />
        </div>

        <h3 className="text-xl font-bold text-[#10233e]">
          {emptyTitle}
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-[#10233e]/55">
          {emptyDescription}
        </p>
      </motion.div>
    );
  }

  return (
   <div className="space-y-5">
    {sizes.length > 0 && (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#10233e]/10 bg-white p-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#10233e]"><SlidersHorizontal size={16} /> Filter by size</span>
        <select aria-label="Filter products by size" value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} className="h-10 min-w-36 rounded-lg border border-[#10233e]/15 bg-white px-3 text-sm text-[#10233e] outline-none focus:ring-2 focus:ring-[#D4AF37]">
          <option value="ALL">All sizes</option>
          {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <span className="text-xs text-slate-500">{filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}</span>
      </div>
    )}
    {filteredProducts.length === 0 ? (
      <p className="rounded-xl border border-dashed border-[#10233e]/20 bg-white p-8 text-center text-sm text-slate-600">No products are available in this size.</p>
    ) : (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
  <AnimatePresence mode="popLayout">
    {filteredProducts.map((product, index) => (
      <div
        key={product.id}
        className="w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)]"
      >
        <ProductCard
          product={product}
          index={index % 8}
        />
      </div>
    ))}
  </AnimatePresence>
</div>
    )}
   </div>
  );
}