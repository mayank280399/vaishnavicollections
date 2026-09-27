"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type TopCollection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  product_count: number;
};

const supabase = createClient();

export default function FeaturedCategories() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [categories, setCategories] = useState<TopCollection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTopCollections = useCallback(async () => {
    try {
      setLoading(true);

      const { data: categoryData, error: categoryError } =
        await supabase
          .from("product_categories")
          .select(
            `
              id,
              name,
              slug,
              description,
              image_url,
              sort_order
            `
          )
          .eq("active", true)
          .eq("is_top_collection", true)
          .is("parent_id", null)
          .order("sort_order", {
            ascending: true,
          })
          .order("name", {
            ascending: true,
          });

      if (categoryError) {
        throw categoryError;
      }

      if (!categoryData || categoryData.length === 0) {
        setCategories([]);
        return;
      }

      const categoryIds = categoryData.map(
        (category) => category.id
      );

      const { data: productsData, error: productsError } =
        await supabase
          .from("products")
          .select("id, category_id")
          .in("category_id", categoryIds);

      if (productsError) {
        throw productsError;
      }

      const productCounts = new Map<string, number>();

      for (const product of productsData ?? []) {
        if (!product.category_id) continue;

        productCounts.set(
          product.category_id,
          (productCounts.get(product.category_id) ?? 0) + 1
        );
      }

      const collections: TopCollection[] = categoryData
        .filter((category) => category.image_url)
        .map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image_url: category.image_url,
          sort_order: category.sort_order,
          product_count:
            productCounts.get(category.id) ?? 0,
        }));

      setCategories(collections);
    } catch (error) {
      console.error(
        "Failed to load top collections:",
        error
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopCollections();
  }, [loadTopCollections]);

  return (
    <section
      ref={ref}
      className="w-full bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={
            inView
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 0.6,
          }}
          className="mb-10 text-center sm:mb-12 lg:mb-14"
        >
          {/* Badge */}
          <span className="mb-4 inline-flex items-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7617]">
            Shop by Category
          </span>

          {/* Heading */}
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#071A35] sm:text-4xl lg:text-5xl">
            Explore Our Collections
          </h2>

          {/* Description */}
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Discover thoughtfully selected products across our
            most-loved categories.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-gray-100" />

                <div className="space-y-3 p-5 sm:p-6">
                  <div className="h-6 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{
                  opacity: 0,
                  y: 32,
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
                  duration: 0.55,
                  delay: i * 0.08,
                }}
              >
                <Link
                  href={`/products?category=${encodeURIComponent(
                    cat.name
                  )}`}
                  className="group relative block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={cat.image_url ?? ""}
                      alt={cat.name}
                      loading={i < 3 ? "eager" : "lazy"}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/70" />

                    {/* Product Count */}
                    <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#071A35] backdrop-blur-sm">
                      {cat.product_count}{" "}
                      {cat.product_count === 1
                        ? "product"
                        : "products"}
                    </span>

                    {/* Arrow */}
                    <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#071A35] shadow-md transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:text-[#071A35]">
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>

                  {/* Information */}
                  <div className="p-5 sm:p-6">
                    <h3 className="text-lg font-semibold text-[#071A35] transition-colors duration-300 group-hover:text-[#9A7617] sm:text-xl">
                      {cat.name}
                    </h3>

                    {cat.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                        {cat.description}
                      </p>
                    )}

                    {/* Explore link */}
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#9A7617]">
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
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-[#071A35]">
              No featured collections available yet.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Top collections will appear here once they are
              enabled from the admin panel.
            </p>
          </div>
        )}

        {/* View All */}
        {!loading && categories.length > 0 && (
          <motion.div
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
              duration: 0.5,
              delay: categories.length * 0.08,
            }}
            className="mt-10 flex justify-center sm:mt-12"
          >
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-xl border border-[#071A35] px-6 py-3 text-sm font-semibold text-[#071A35] transition-all duration-300 hover:bg-[#071A35] hover:text-white"
            >
              View All Collections

              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}