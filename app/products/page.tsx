"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductCard, {
  type StorefrontProduct,
} from "@/components/ProductCard/ProductCard";

import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Search,
  Loader2,
  Package,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { createClient } from "@/lib/supabase/client";

/* =========================================================
   TYPES
========================================================= */

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  active: boolean;
};

type SupabaseProduct = {
  id: string;
  category_id: string | null;
  sku: string | null;
  name: string;
  product_title: string | null;
  short_description: string | null;
  selling_price: number | null;
  online_price: number | null;
  stock_quantity: number | null;
  online_enabled: boolean | null;
  visibility:
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED";
  featured: boolean | null;
  created_at: string;
  updated_at: string;
};

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean | null;
};

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDisplayTitle(
  product: SupabaseProduct,
) {
  return (
    product.product_title?.trim() ||
    product.name
  );
}

/**
 * Used when a product does not have an image yet.
 * This avoids a broken <img> while keeping the
 * ProductCard unchanged.
 */
function getPlaceholderImage() {
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="800"
      height="800"
      viewBox="0 0 800 800"
    >
      <rect
        width="800"
        height="800"
        fill="#F4F0E9"
      />
      <g
        fill="none"
        stroke="#1B263B"
        stroke-width="8"
        opacity="0.18"
      >
        <rect
          x="250"
          y="250"
          width="300"
          height="240"
          rx="24"
        />
        <path
          d="M300 490l80-85 65 60 45-50 110 75"
        />
        <circle
          cx="420"
          cy="330"
          r="28"
        />
      </g>
      <text
        x="400"
        y="570"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="32"
        fill="#1B263B"
        opacity="0.45"
      >
        Vaishnavi Collections
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    svg,
  )}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function ProductsPage() {
  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const [products, setProducts] =
    useState<SupabaseProduct[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [productImages, setProductImages] =
    useState<ProductImage[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     FILTER STATE
  ======================================================= */

  const [selectedCategory, setSelectedCategory] =
    useState<string>("ALL");

  const [selectedSubcategory, setSelectedSubcategory] =
    useState<string>("ALL");

  const [priceRange, setPriceRange] =
    useState<number>(1000);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const [sortBy, setSortBy] =
    useState("Newest");

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const [
          productsResult,
          categoriesResult,
          imagesResult,
        ] = await Promise.all([
          supabase
            .from("products")
            .select(
              `
                id,
                category_id,
                sku,
                name,
                product_title,
                short_description,
                selling_price,
                online_price,
                stock_quantity,
                online_enabled,
                visibility,
                featured,
                created_at,
                updated_at
              `,
            )
            .eq("visibility", "PUBLISHED")
            .eq("online_enabled", true)
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("product_categories")
            .select(
              `
                id,
                name,
                parent_id,
                active
              `,
            )
            .eq("active", true)
            .order("name", {
              ascending: true,
            }),

          supabase
            .from("product_images")
            .select(
              `
                id,
                product_id,
                image_url,
                is_primary
              `,
            ),
        ]);

        if (productsResult.error) {
          throw productsResult.error;
        }

        if (categoriesResult.error) {
          throw categoriesResult.error;
        }

        if (imagesResult.error) {
          throw imagesResult.error;
        }

        if (!mounted) {
          return;
        }

        setProducts(
          productsResult.data ?? [],
        );

        setCategories(
          categoriesResult.data ?? [],
        );

        setProductImages(
          imagesResult.data ?? [],
        );
      } catch (err) {
        console.error(
          "Failed to load storefront products:",
          err,
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load products.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  /* =======================================================
     CATEGORY HELPERS
  ======================================================= */

  const parentCategories =
    useMemo(() => {
      return categories.filter(
        (category) =>
          category.parent_id === null,
      );
    }, [categories]);

  const subcategories =
    useMemo(() => {
      if (
        selectedCategory === "ALL"
      ) {
        return categories.filter(
          (category) =>
            category.parent_id !== null,
        );
      }

      return categories.filter(
        (category) =>
          category.parent_id ===
          selectedCategory,
      );
    }, [
      categories,
      selectedCategory,
    ]);

  function getCategory(
    categoryId: string | null,
  ) {
    if (!categoryId) {
      return null;
    }

    return (
      categories.find(
        (category) =>
          category.id === categoryId,
      ) ?? null
    );
  }

  function getParentCategory(
    categoryId: string | null,
  ) {
    const category =
      getCategory(categoryId);

    if (!category) {
      return null;
    }

    if (!category.parent_id) {
      return category;
    }

    return getCategory(
      category.parent_id,
    );
  }

  /* =======================================================
     IMAGE MAP
  ======================================================= */

  const imageMap = useMemo(() => {
    const map = new Map<
      string,
      string
    >();

    /*
     * Prefer primary image.
     */
    for (const image of productImages) {
      if (
        image.is_primary &&
        !map.has(image.product_id)
      ) {
        map.set(
          image.product_id,
          image.image_url,
        );
      }
    }

    /*
     * Fallback to first image if
     * no primary image exists.
     */
    for (const image of productImages) {
      if (!map.has(image.product_id)) {
        map.set(
          image.product_id,
          image.image_url,
        );
      }
    }

    return map;
  }, [productImages]);

  /* =======================================================
     PRICE RANGE
  ======================================================= */

  const maximumProductPrice =
    useMemo(() => {
      if (!products.length) {
        return 1000;
      }

      const highestPrice =
        Math.max(
          ...products.map(
            (product) =>
              Number(
                product.online_price ??
                  product.selling_price ??
                  0,
              ),
          ),
        );

      if (highestPrice <= 1000) {
        return 1000;
      }

      return (
        Math.ceil(
          highestPrice / 500,
        ) * 500
      );
    }, [products]);

  useEffect(() => {
    if (
      priceRange > maximumProductPrice
    ) {
      setPriceRange(
        maximumProductPrice,
      );
    }
  }, [
    maximumProductPrice,
    priceRange,
  ]);

  /* =======================================================
     FILTERED PRODUCTS
  ======================================================= */

  const filteredProducts =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      const filtered =
        products.filter(
          (product) => {
            const displayTitle =
              getDisplayTitle(
                product,
              ).toLowerCase();

            const internalName =
              product.name.toLowerCase();

            const sku =
              (
                product.sku ?? ""
              ).toLowerCase();

            const category =
              getCategory(
                product.category_id,
              );

            const parentCategory =
              getParentCategory(
                product.category_id,
              );

            const price =
              Number(
                product.online_price ??
                  product.selling_price ??
                  0,
              );

            const matchesSearch =
              !query ||
              displayTitle.includes(
                query,
              ) ||
              internalName.includes(
                query,
              ) ||
              sku.includes(query);

            /*
             * Parent category selection:
             * A product assigned to a subcategory
             * is also included when its parent
             * category is selected.
             */
            const matchesCategory =
              selectedCategory ===
                "ALL" ||
              category?.id ===
                selectedCategory ||
              parentCategory?.id ===
                selectedCategory;

            const matchesSubcategory =
              selectedSubcategory ===
                "ALL" ||
              category?.id ===
                selectedSubcategory;

            const matchesPrice =
              price <= priceRange;

            return (
              matchesSearch &&
              matchesCategory &&
              matchesSubcategory &&
              matchesPrice
            );
          },
        );

      return filtered.sort(
        (a, b) => {
          const priceA =
            Number(
              a.online_price ??
                a.selling_price ??
                0,
            );

          const priceB =
            Number(
              b.online_price ??
                b.selling_price ??
                0,
            );

          if (
            sortBy ===
            "Price: Low to High"
          ) {
            return priceA - priceB;
          }

          if (
            sortBy ===
            "Price: High to Low"
          ) {
            return priceB - priceA;
          }

          if (
            sortBy === "Name"
          ) {
            return getDisplayTitle(
              a,
            ).localeCompare(
              getDisplayTitle(b),
            );
          }

          /*
           * Newest
           */
          return (
            new Date(
              b.created_at,
            ).getTime() -
            new Date(
              a.created_at,
            ).getTime()
          );
        },
      );
    }, [
      products,
      categories,
      searchQuery,
      selectedCategory,
      selectedSubcategory,
      priceRange,
      sortBy,
    ]);

  /* =======================================================
     STOREFRONT PRODUCTS
  ======================================================= */

  const storefrontProducts =
    useMemo(() => {
      return filteredProducts.map(
        (product) => {
          const sellingPrice =
            Number(
              product.selling_price ??
                0,
            );

          const onlinePrice =
            product.online_price !==
              null &&
            product.online_price !==
              undefined
              ? Number(
                  product.online_price,
                )
              : sellingPrice;

          const hasDiscount =
            onlinePrice <
            sellingPrice;

          const category =
            getCategory(
              product.category_id,
            );

          return {
            id: product.id,
            name: product.name,
            product_title:
              product.product_title,
            image:
              imageMap.get(
                product.id,
              ) ??
              getPlaceholderImage(),
            price: onlinePrice,
            originalPrice:
              hasDiscount
                ? sellingPrice
                : null,
            category:
              category?.name ??
              null,
            badge:
              product.featured
                ? "Featured"
                : null,
            stockQuantity:
              Number(
                product.stock_quantity ??
                  0,
              ),
          } satisfies StorefrontProduct;
        },
      );
    }, [
      filteredProducts,
      imageMap,
      categories,
    ]);

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const resetFilters = () => {
    setSelectedCategory("ALL");
    setSelectedSubcategory("ALL");
    setPriceRange(
      maximumProductPrice,
    );
    setSearchQuery("");
  };

  function handleCategoryChange(
    categoryId: string,
  ) {
    setSelectedCategory(
      categoryId,
    );
    setSelectedSubcategory(
      "ALL",
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <Navbar />

      <main className="w-full overflow-hidden bg-[#F8F7F4]">
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <section className="bg-[#1B263B] px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              className="max-w-2xl"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
              }}
            >
              <span className="mb-4 inline-flex items-center rounded-full border border-[#C88A3D]/30 bg-[#C88A3D]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#C88A3D]">
                Shop
              </span>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Our Collection
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                Explore our carefully
                curated collection of
                products for your home,
                lifestyle, and everyday
                needs.
              </p>
            </motion.div>
          </div>
        </section>

        {/* =====================================================
            PRODUCTS AREA
        ====================================================== */}

        <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="mx-auto w-full max-w-7xl">
            <div className="relative flex gap-8 lg:items-start">
              {/* =================================================
                  MOBILE OVERLAY
              ================================================== */}

              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    onClick={() =>
                      setIsSidebarOpen(
                        false,
                      )
                    }
                  />
                )}
              </AnimatePresence>

              {/* =================================================
                  FILTER SIDEBAR
              ================================================== */}

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
                    onClick={() =>
                      setIsSidebarOpen(
                        false,
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#1B263B]/60 transition hover:bg-[#F8F7F4] hover:text-[#1B263B] lg:hidden"
                    aria-label="Close filters"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-7 p-5 lg:p-6">
                  {/* SEARCH */}

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
                        value={
                          searchQuery
                        }
                        onChange={(
                          event,
                        ) =>
                          setSearchQuery(
                            event.target
                              .value,
                          )
                        }
                        className="min-w-0 flex-1 bg-transparent text-sm text-[#1B263B] outline-none placeholder:text-[#1B263B]/35"
                      />
                    </div>
                  </div>

                  {/* CATEGORIES */}

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#1B263B]">
                      Categories
                    </h3>

                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleCategoryChange(
                            "ALL",
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          selectedCategory ===
                          "ALL"
                            ? "bg-[#C88A3D]/10 font-semibold text-[#C88A3D]"
                            : "text-[#1B263B]/65 hover:bg-[#F8F7F4] hover:text-[#1B263B]"
                        }`}
                      >
                        <span>
                          All Products
                        </span>

                        <span className="text-xs opacity-60">
                          (
                          {
                            products.length
                          }
                          )
                        </span>
                      </button>

                      {parentCategories.map(
                        (
                          category,
                        ) => {
                          const count =
                            products.filter(
                              (
                                product,
                              ) => {
                                const parent =
                                  getParentCategory(
                                    product.category_id,
                                  );

                                return (
                                  parent?.id ===
                                  category.id
                                );
                              },
                            ).length;

                          return (
                            <button
                              key={
                                category.id
                              }
                              type="button"
                              onClick={() =>
                                handleCategoryChange(
                                  category.id,
                                )
                              }
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                selectedCategory ===
                                category.id
                                  ? "bg-[#C88A3D]/10 font-semibold text-[#C88A3D]"
                                  : "text-[#1B263B]/65 hover:bg-[#F8F7F4] hover:text-[#1B263B]"
                              }`}
                            >
                              <span>
                                {
                                  category.name
                                }
                              </span>

                              <span className="text-xs opacity-60">
                                (
                                {
                                  count
                                }
                                )
                              </span>
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* SUBCATEGORIES */}

                  {subcategories.length >
                    0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-[#1B263B]">
                        Subcategories
                      </h3>

                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSubcategory(
                              "ALL",
                            )
                          }
                          className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            selectedSubcategory ===
                            "ALL"
                              ? "bg-[#C88A3D]/10 font-semibold text-[#C88A3D]"
                              : "text-[#1B263B]/65 hover:bg-[#F8F7F4]"
                          }`}
                        >
                          All
                        </button>

                        {subcategories.map(
                          (
                            category,
                          ) => (
                            <button
                              key={
                                category.id
                              }
                              type="button"
                              onClick={() =>
                                setSelectedSubcategory(
                                  category.id,
                                )
                              }
                              className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                selectedSubcategory ===
                                category.id
                                  ? "bg-[#C88A3D]/10 font-semibold text-[#C88A3D]"
                                  : "text-[#1B263B]/65 hover:bg-[#F8F7F4]"
                              }`}
                            >
                              {
                                category.name
                              }
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* PRICE */}

                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-[#1B263B]">
                      Price Range
                    </h3>

                    <input
                      type="range"
                      min="0"
                      max={
                        maximumProductPrice
                      }
                      step="10"
                      value={
                        Math.min(
                          priceRange,
                          maximumProductPrice,
                        )
                      }
                      onChange={(
                        event,
                      ) =>
                        setPriceRange(
                          Number(
                            event.target
                              .value,
                          ),
                        )
                      }
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#1B263B]/15 accent-[#C88A3D]"
                    />

                    <div className="mt-3 flex items-center justify-between text-xs text-[#1B263B]/55">
                      <span>
                        ₹0
                      </span>

                      <span className="font-medium text-[#1B263B]">
                        Up to{" "}
                        {formatCurrency(
                          priceRange,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* RESET */}

                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="w-full rounded-xl border border-[#1B263B]/15 px-4 py-3 text-sm font-semibold text-[#1B263B] transition hover:border-[#C88A3D] hover:bg-[#C88A3D]/5 hover:text-[#C88A3D]"
                  >
                    Clear All Filters
                  </button>
                </div>
              </aside>

              {/* =================================================
                  RESULTS
              ================================================== */}

              <div className="min-w-0 flex-1">
                {/* TOOLBAR */}

                <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#1B263B]/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#1B263B]/60">
                    Showing{" "}
                    <span className="font-semibold text-[#1B263B]">
                      {
                        filteredProducts.length
                      }
                    </span>{" "}
                    products
                  </p>

                  <div className="flex items-center gap-3">
                    {/* MOBILE FILTERS */}

                    <button
                      type="button"
                      onClick={() =>
                        setIsSidebarOpen(
                          true,
                        )
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#1B263B]/15 px-3 text-sm font-medium text-[#1B263B] transition hover:border-[#C88A3D] hover:text-[#C88A3D] lg:hidden"
                    >
                      <SlidersHorizontal
                        size={17}
                      />

                      Filters
                    </button>

                    {/* SORT */}

                    <div className="relative">
                      <select
                        value={
                          sortBy
                        }
                        onChange={(
                          event,
                        ) =>
                          setSortBy(
                            event.target
                              .value,
                          )
                        }
                        className="h-10 appearance-none rounded-lg border border-[#1B263B]/15 bg-white pl-3 pr-9 text-sm text-[#1B263B] outline-none transition focus:border-[#C88A3D] focus:ring-2 focus:ring-[#C88A3D]/10"
                      >
                        <option>
                          Newest
                        </option>

                        <option>
                          Price: Low to High
                        </option>

                        <option>
                          Price: High to Low
                        </option>

                        <option>
                          Name
                        </option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#1B263B]/50"
                      />
                    </div>
                  </div>
                </div>

                {/* =================================================
                    LOADING
                ================================================== */}

                {loading ? (
                  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#1B263B]/10 bg-white">
                    <Loader2 className="h-8 w-8 animate-spin text-[#C88A3D]" />

                    <p className="mt-4 text-sm text-[#1B263B]/55">
                      Loading products...
                    </p>
                  </div>
                ) : error ? (
                  /* =================================================
                      ERROR
                  ================================================== */

                  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-red-200 bg-white px-6 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                      <Package size={28} />
                    </div>

                    <h3 className="text-xl font-bold text-[#1B263B]">
                      Unable to load products
                    </h3>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-[#1B263B]/55">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        window.location.reload()
                      }
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#C88A3D] px-6 text-sm font-semibold text-white transition hover:bg-[#B77830]"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredProducts.length >
                  0 ? (
                  /* =================================================
                      PRODUCTS
                  ================================================== */

                  <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence mode="popLayout">
                      {storefrontProducts.map(
                        (
                          product,
                          index,
                        ) => (
                          <ProductCard
                            key={
                              product.id
                            }
                            product={
                              product
                            }
                            index={
                              index % 8
                            }
                          />
                        ),
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* =================================================
                      EMPTY STATE
                  ================================================== */

                  <motion.div
                    className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#1B263B]/10 bg-white px-6 text-center"
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                  >
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#C88A3D]/10 text-[#C88A3D]">
                      <Search size={28} />
                    </div>

                    <h3 className="text-xl font-bold text-[#1B263B]">
                      No products found
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#1B263B]/55">
                      Try adjusting your
                      filters or search
                      terms.
                    </p>

                    <button
                      type="button"
                      onClick={
                        resetFilters
                      }
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