"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

import ProductCard from "@/components/ProductCard/ProductCard";
import type { StorefrontProduct } from "@/components/ProductCard/ProductCard";

interface FeaturedProductsClientProps {
  products: StorefrontProduct[];
}

export default function FeaturedProductsClient({
  products,
}: FeaturedProductsClientProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  return (
    <section
      ref={ref}
      className="w-full bg-[#F8F7F4] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col gap-6 sm:mb-12 lg:mb-14 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center rounded-full border border-[#C88A3D]/25 bg-[#C88A3D]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#C88A3D]">
              Handpicked for You
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1B263B] sm:text-4xl lg:text-5xl">
              Featured Products
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
              A handpicked selection from Vaishnavi Collections, chosen
              especially for you.
            </p>
          </div>

          <Link
            href="/products"
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-[#1B263B] bg-white px-5 py-3 text-sm font-semibold text-[#1B263B] shadow-sm transition-all duration-300 hover:bg-[#1B263B] hover:text-white sm:px-6"
          >
            View All Products

            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>

        {/* Products */}
       <div className="flex flex-wrap justify-center gap-x-3 gap-y-8 sm:gap-5 lg:gap-6">
  {products.map((product, index) => (
    <div
      key={product.id}
      className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-1.125rem)]"
    >
      <ProductCard
        product={product}
        index={index}
        inView={inView}
      />
    </div>
  ))}
</div>

        {/* Mobile View All */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.5,
            delay: products.length * 0.06,
          }}
          className="mt-10 flex justify-center lg:hidden"
        >
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#1B263B] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#263852]"
          >
            View All Products

            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}