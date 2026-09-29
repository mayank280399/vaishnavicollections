"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

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
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index % 8}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}