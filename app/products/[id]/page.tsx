"use client";

import React, { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Minus,
  Plus,
  Heart,
  Truck,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { products } from "@/lib/data";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductCard from "@/components/ProductCard/ProductCard";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id);
  const product = products.find((p) => p.id === productId);

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [activeTab, setActiveTab] = useState("details");
  const [activeImage, setActiveImage] = useState(product?.image || "");

  if (!product) {
    return (
      <>
        <Navbar />

        <main className="min-h-[70vh] bg-[#F8F7F4] px-4 py-32 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center text-center">
            <span className="mb-4 rounded-full bg-[#C88A3D]/10 px-4 py-2 text-sm font-semibold text-[#C88A3D]">
              Product
            </span>

            <h1 className="text-3xl font-bold tracking-tight text-[#1B263B] sm:text-4xl">
              Product Not Found
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
              The product you are looking for may have been removed or is no
              longer available.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#1B263B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#162033]"
            >
              <ArrowLeft size={18} />
              Back to Shop
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const galleryImages = [product.image];

  return (
    <>
      <Navbar />

      <main className="bg-white">
        {/* Product Section */}
        <section className="bg-[#F8F7F4] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12 xl:gap-16">
              {/* ==================== GALLERY ==================== */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="min-w-0"
              >
                {/* Main Image */}
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm sm:rounded-3xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={activeImage}
                        alt={product.name}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Product Badge */}
                  {product.badge && (
                    <span className="absolute left-4 top-4 z-10 rounded-full bg-[#C88A3D] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm sm:left-5 sm:top-5">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {galleryImages.length > 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto">
                    {galleryImages.map((img, i) => {
                      const isActive = activeImage === img;

                      return (
                        <button
                          key={`${img}-${i}`}
                          type="button"
                          onClick={() => setActiveImage(img)}
                          className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all sm:h-24 sm:w-24 ${
                            isActive
                              ? "border-[#C88A3D] ring-2 ring-[#C88A3D]/20"
                              : "border-transparent hover:border-[#1B263B]/20"
                          }`}
                          aria-label={`View ${product.name} image ${i + 1}`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} view ${i + 1}`}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* ==================== PRODUCT INFO ==================== */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="min-w-0"
              >
                {/* Header */}
                <div className="border-b border-gray-200 pb-6">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#C88A3D]">
                    {product.category}
                  </span>

                  <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-[#1B263B] sm:text-4xl lg:text-5xl">
                    {product.name}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-[#C88A3D]/10 px-3 py-1.5">
                      <Star
                        size={16}
                        fill="#C88A3D"
                        stroke="none"
                      />
                      <span className="text-sm font-bold text-[#1B263B]">
                        {product.rating}
                      </span>
                    </div>

                    <span className="text-sm text-gray-500">
                      ({product.reviewCount} customer reviews)
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-3xl font-bold text-[#1B263B] sm:text-4xl">
                    ₹{product.price}
                  </span>

                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-5 text-sm leading-7 text-gray-600 sm:text-base">
                  {product.description}
                </p>

                {/* Options */}
                <div className="mt-8 space-y-7">
                  {/* Colors */}
                  {product.colors?.length > 0 && (
                    <div>
                      <span className="text-sm font-bold text-[#1B263B]">
                        Color Selection
                      </span>

                      <div className="mt-3 flex flex-wrap gap-3">
                        {product.colors.map((color, i) => {
                          const isSelected = selectedColor === color;

                          return (
                            <button
                              key={`${color}-${i}`}
                              type="button"
                              onClick={() => setSelectedColor(color)}
                              title={color}
                              aria-label={`Select ${color}`}
                              className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${
                                isSelected
                                  ? "border-[#C88A3D] ring-2 ring-[#C88A3D]/20"
                                  : "border-gray-200 hover:border-[#1B263B]/40"
                              }`}
                            >
                              <span
                                className="h-7 w-7 rounded-full border border-black/10"
                                style={{ backgroundColor: color }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity + Actions */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex h-12 w-fit items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(Math.max(1, quantity - 1))
                        }
                        className="flex h-full w-12 items-center justify-center text-[#1B263B] transition-colors hover:bg-gray-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={18} />
                      </button>

                      <span className="flex min-w-10 justify-center text-sm font-bold text-[#1B263B]">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="flex h-full w-12 items-center justify-center text-[#1B263B] transition-colors hover:bg-gray-50"
                        aria-label="Increase quantity"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#1B263B] px-6 text-sm font-bold text-white transition-colors hover:bg-[#162033]"
                    >
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      aria-label="Add to wishlist"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#1B263B] transition-all hover:border-[#C88A3D] hover:text-[#C88A3D]"
                    >
                      <Heart size={20} />
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 grid grid-cols-1 gap-4 border-y border-gray-200 py-6 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C88A3D]/10 text-[#C88A3D]">
                      <Truck size={19} />
                    </div>

                    <span className="text-xs font-semibold text-[#1B263B] sm:text-sm">
                      Free Express Delivery
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C88A3D]/10 text-[#C88A3D]">
                      <RotateCcw size={19} />
                    </div>

                    <span className="text-xs font-semibold text-[#1B263B] sm:text-sm">
                      30-Day Free Returns
                    </span>
                  </div>
                </div>

                {/* ==================== TABS ==================== */}
                <div className="mt-8">
                  <div className="flex overflow-x-auto border-b border-gray-200">
                    {["Details", "Specifications", "Shipping"].map((tab) => {
                      const tabKey = tab.toLowerCase();
                      const isActive = activeTab === tabKey;

                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tabKey)}
                          className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors first:pl-0 ${
                            isActive
                              ? "text-[#1B263B]"
                              : "text-gray-400 hover:text-[#1B263B]"
                          }`}
                        >
                          {tab}

                          {isActive && (
                            <motion.div
                              layoutId="product-tab-indicator"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C88A3D]"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-6">
                    <AnimatePresence mode="wait">
                      {/* Details */}
                      {activeTab === "details" && (
                        <motion.div
                          key="details"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-sm leading-7 text-gray-600">
                            Crafted with the finest materials and an unwavering
                            commitment to quality. Every Vaishnavi Collections
                            piece is a testament to timeless design and modern
                            functionality.
                          </p>

                          <ul className="mt-5 space-y-3">
                            {product.tags.map((tag) => (
                              <li
                                key={tag}
                                className="flex items-center gap-3 text-sm text-gray-600"
                              >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C88A3D]" />

                                <span>
                                  {tag.charAt(0).toUpperCase() + tag.slice(1)}{" "}
                                  quality construction
                                </span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                      {/* Specifications */}
                      {activeTab === "specifications" && (
                        <motion.div
                          key="specifications"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                        >
                          <div className="rounded-xl bg-[#F8F7F4] p-4">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Materials
                            </span>
                            <span className="mt-1 block text-sm font-semibold text-[#1B263B]">
                              Premium grade materials
                            </span>
                          </div>

                          <div className="rounded-xl bg-[#F8F7F4] p-4">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Dimensions
                            </span>
                            <span className="mt-1 block text-sm font-semibold text-[#1B263B]">
                              H: 120cm, W: 60cm, D: 60cm
                            </span>
                          </div>

                          <div className="rounded-xl bg-[#F8F7F4] p-4">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Weight
                            </span>
                            <span className="mt-1 block text-sm font-semibold text-[#1B263B]">
                              12.5 kg
                            </span>
                          </div>

                          <div className="rounded-xl bg-[#F8F7F4] p-4">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Assembly
                            </span>
                            <span className="mt-1 block text-sm font-semibold text-[#1B263B]">
                              Minimal assembly required
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {/* Shipping */}
                      {activeTab === "shipping" && (
                        <motion.div
                          key="shipping"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4 text-sm leading-7 text-gray-600"
                        >
                          <div className="rounded-xl bg-[#F8F7F4] p-5">
                            <h3 className="font-bold text-[#1B263B]">
                              Delivery
                            </h3>

                            <p className="mt-2">
                              We offer convenient delivery options for your
                              order. Delivery availability and timelines may
                              vary depending on your location.
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#F8F7F4] p-5">
                            <h3 className="font-bold text-[#1B263B]">
                              Returns
                            </h3>

                            <p className="mt-2">
                              Please check the product-specific return
                              conditions before placing your order.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==================== RELATED PRODUCTS ==================== */}
        {relatedProducts.length > 0 && (
          <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 sm:mb-10">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#C88A3D]">
                  You May Also Like
                </span>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#1B263B] sm:text-3xl">
                  Complete the Look
                </h2>

                <p className="mt-2 text-sm text-gray-500 sm:text-base">
                  Designed to pair perfectly with your selection.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}