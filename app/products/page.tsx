"use client";

import React, { useMemo, useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductCard from "@/components/ProductCard/ProductCard";
import { products, categories, filterColors } from "@/lib/data";
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Star,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<number>(500);
  const [minRating, setMinRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Newest");

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === "All" ||
          product.category === selectedCategory;

        const matchesColor =
          !selectedColor || product.colors.includes(selectedColor);

        const matchesPrice = product.price <= priceRange;

        const matchesRating = product.rating >= minRating;

        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        return (
          matchesCategory &&
          matchesColor &&
          matchesPrice &&
          matchesRating &&
          matchesSearch
        );
      })
      .sort((a, b) => {
        if (sortBy === "Price: Low to High") {
          return a.price - b.price;
        }

        if (sortBy === "Price: High to Low") {
          return b.price - a.price;
        }

        if (sortBy === "Rating") {
          return b.rating - a.rating;
        }

        return b.id - a.id;
      });
  }, [
    selectedCategory,
    selectedColor,
    priceRange,
    minRating,
    searchQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedColor(null);
    setPriceRange(500);
    setMinRating(0);
    setSearchQuery("");
  };

  return (
    <>
      <Navbar />

      <main className="w-full overflow-hidden bg-[#F8F7F4]">
        {/* =========================================================
            PAGE HEADER
        ========================================================== */}
        <section className="bg-[#1B263B] px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              className="max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="mb-4 inline-flex items-center rounded-full border border-[#C88A3D]/30 bg-[#C88A3D]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#C88A3D]">
                Shop
              </span>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Our Collection
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                Explore our carefully curated selection of premium home
                essentials.
              </p>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
            PRODUCTS AREA
        ========================================================== */}
        <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="mx-auto w-full max-w-7xl">
            <div className="relative flex gap-8 lg:items-start">
              {/* ===================================================
                  MOBILE OVERLAY
              ==================================================== */}
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSidebarOpen(false)}
                  />
                )}
              </AnimatePresence>

              {/* ===================================================
                  FILTER SIDEBAR
              ==================================================== */}
              <aside
                className={`
                  fixed inset-y-0 left-0 z-50 w-[min(88vw,360px)]
                  overflow-y-auto bg-white shadow-2xl
                  transition-transform duration-300
                  lg:sticky lg:top-24 lg:z-10 lg:block lg:w-[270px]
                  lg:shrink-0 lg:translate-x-0 lg:overflow-visible
                  lg:rounded-2xl lg:border lg:border-[#1B263B]/10
                  lg:shadow-sm
                  ${
                    isSidebarOpen
                      ? "translate-x-0"
                      : "-translate-x-full"
                  }
                `}
              >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between border-b border-[#1B263B]/10 px-5 py-5 lg:px-6">
                  <h2 className="text-lg font-bold text-[#1B263B]">
                    Filters
                  </h2>

                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#1B263B]/60 transition hover:bg-[#F8F7F4] hover:text-[#1B263B] lg:hidden"
                    aria-label="Close filters"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-7 p-5 lg:p-6">
                  {/* Search */}
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#1B263B]">
                      Search
                    </h3>

                    <div className="flex h-11 items-center gap-2 rounded-xl border border-[#1B263B]/15 bg-[#F8F7F4] px-3 transition focus-within:border-[#C88A3D] focus-within:ring-2 focus-within:ring-[#C88A3D]/10">
                      <Search
                        size={17}
                        className="shrink-0 text-[#1B263B]/40"
                      />

                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-sm text-[#1B263B] outline-none placeholder:text-[#1B263B]/35"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#1B263B]">
                      Categories
                    </h3>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("All")}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          selectedCategory === "All"
                            ? "bg-[#C88A3D]/10 font-semibold text-[#C88A3D]"
                            : "text-[#1B263B]/65 hover:bg-[#F8F7F4] hover:text-[#1B263B]"
                        }`}
                      >
                        <span>All Products</span>
                      </button>

                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            selectedCategory === cat.name
                              ? "bg-[#C88A3D]/10 font-semibold text-[#C88A3D]"
                              : "text-[#1B263B]/65 hover:bg-[#F8F7F4] hover:text-[#1B263B]"
                          }`}
                        >
                          <span>{cat.name}</span>

                          <span className="text-xs opacity-60">
                            ({cat.count})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-[#1B263B]">
                      Price Range
                    </h3>

                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={priceRange}
                      onChange={(e) =>
                        setPriceRange(parseInt(e.target.value))
                      }
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#1B263B]/15 accent-[#C88A3D]"
                    />

                    <div className="mt-3 flex items-center justify-between text-xs text-[#1B263B]/55">
                      <span>₹0</span>

                      <span className="font-medium text-[#1B263B]">
                        Current: ₹{priceRange}
                      </span>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-[#1B263B]">
                      Colors
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      {filterColors.map((color) => {
                        const isActive = selectedColor === color.hex;

                        return (
                          <button
                            key={color.name}
                            type="button"
                            title={color.name}
                            aria-label={`Filter by ${color.name}`}
                            onClick={() =>
                              setSelectedColor(
                                isActive ? null : color.hex
                              )
                            }
                            className={`relative h-8 w-8 rounded-full border-2 transition ${
                              isActive
                                ? "scale-110 border-[#C88A3D] ring-2 ring-[#C88A3D]/20 ring-offset-2"
                                : "border-[#1B263B]/10 hover:scale-105"
                            }`}
                            style={{
                              backgroundColor: color.hex,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#1B263B]">
                      Minimum Rating
                    </h3>

                    <div className="space-y-1">
                      {[4, 3, 2, 1].map((rating) => {
                        const isActive = minRating === rating;

                        return (
                          <button
                            key={rating}
                            type="button"
                            onClick={() =>
                              setMinRating(isActive ? 0 : rating)
                            }
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                              isActive
                                ? "bg-[#C88A3D]/10 text-[#C88A3D]"
                                : "text-[#1B263B]/60 hover:bg-[#F8F7F4]"
                            }`}
                          >
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={
                                    i < rating ? "#C88A3D" : "none"
                                  }
                                  stroke={
                                    i < rating
                                      ? "#C88A3D"
                                      : "#1B263B"
                                  }
                                  className={
                                    i < rating
                                      ? ""
                                      : "opacity-25"
                                  }
                                />
                              ))}
                            </div>

                            <span>& Up</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reset */}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="w-full rounded-xl border border-[#1B263B]/15 px-4 py-3 text-sm font-semibold text-[#1B263B] transition hover:border-[#C88A3D] hover:bg-[#C88A3D]/5 hover:text-[#C88A3D]"
                  >
                    Clear All Filters
                  </button>
                </div>
              </aside>

              {/* ===================================================
                  RESULTS
              ==================================================== */}
              <div className="min-w-0 flex-1">
                {/* Toolbar */}
                <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#1B263B]/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#1B263B]/60">
                    Showing{" "}
                    <span className="font-semibold text-[#1B263B]">
                      {filteredProducts.length}
                    </span>{" "}
                    products
                  </p>

                  <div className="flex items-center gap-3">
                    {/* Mobile Filters */}
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(true)}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#1B263B]/15 px-3 text-sm font-medium text-[#1B263B] transition hover:border-[#C88A3D] hover:text-[#C88A3D] lg:hidden"
                    >
                      <SlidersHorizontal size={17} />
                      Filters
                    </button>

                    {/* Sort */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-10 appearance-none rounded-lg border border-[#1B263B]/15 bg-white pl-3 pr-9 text-sm text-[#1B263B] outline-none transition focus:border-[#C88A3D] focus:ring-2 focus:ring-[#C88A3D]/10"
                      >
                        <option>Newest</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Rating</option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#1B263B]/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Products */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={index % 8}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#1B263B]/10 bg-white px-6 text-center"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#C88A3D]/10 text-[#C88A3D]">
                      <Search size={28} />
                    </div>

                    <h3 className="text-xl font-bold text-[#1B263B]">
                      No products found
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#1B263B]/55">
                      Try adjusting your filters or search terms.
                    </p>

                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#C88A3D] px-6 text-sm font-semibold text-white transition hover:bg-[#B77830]"
                    >
                      Clear Filters
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}