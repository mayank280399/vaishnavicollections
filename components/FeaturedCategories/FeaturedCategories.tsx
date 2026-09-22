"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { categories } from "@/lib/data";
import { ArrowRight } from "lucide-react";

export default function FeaturedCategories() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      ref={ref}
      className="w-full bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-12 lg:mb-14"
        >
          {/* Badge */}
          <span className="mb-4 inline-flex items-center rounded-full border border-[#C88A3D]/25 bg-[#C88A3D]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#C88A3D]">
            Browse By Category
          </span>

          {/* Heading */}
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1B263B] sm:text-4xl lg:text-5xl">
            Explore Our Collections
          </h2>

          {/* Description */}
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Thoughtfully curated objects for every corner of your home.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.55,
                delay: i * 0.08,
              }}
            >
              <Link
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Image Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/70" />

                  {/* Product Count */}
                  <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#1B263B] backdrop-blur-sm">
                    {cat.count} products
                  </span>

                  {/* Arrow */}
                  <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#1B263B] shadow-md transition-all duration-300 group-hover:bg-[#C88A3D] group-hover:text-white">
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>

                {/* Information */}
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-semibold text-[#1B263B] transition-colors duration-300 group-hover:text-[#C88A3D] sm:text-xl">
                    {cat.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                    {cat.description}
                  </p>

                  {/* Explore link */}
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#C88A3D]">
                    Explore Collection
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.5,
            delay: categories.length * 0.08,
          }}
          className="mt-10 flex justify-center sm:mt-12"
        >
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-xl border border-[#1B263B] px-6 py-3 text-sm font-semibold text-[#1B263B] transition-all duration-300 hover:bg-[#1B263B] hover:text-white"
          >
            View All Collections
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}