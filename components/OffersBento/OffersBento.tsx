"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  ArrowRight,
  Tag,
  Truck as TruckIcon,
  Users,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { offers } from "@/lib/data";

const IconMap: Record<number, React.ReactNode> = {
  1: <TruckIcon size={24} />,
  2: <Tag size={24} />,
  3: <Users size={24} />,
  4: <Tag size={24} />,
  5: <Calendar size={24} />,
};

export default function OffersBento() {
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
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-12 lg:mb-14"
        >
          <span className="mb-4 inline-flex items-center rounded-full border border-[#C88A3D]/25 bg-[#C88A3D]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#C88A3D]">
            Special Deals
          </span>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1B263B] sm:text-4xl lg:text-5xl">
            Offers For You
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Don&apos;t miss out on our limited time offers and exclusive member
            benefits.
          </p>
        </motion.div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {offers.map((offer, index) => {
            /*
             * Keep the existing `offer.size` data working.
             * If your data contains values such as:
             * "large", "wide", "tall", "normal"
             * you can map them here.
             */
            const sizeClass =
              offer.size === "large"
                ? "sm:col-span-2 sm:row-span-2"
                : offer.size === "wide"
                  ? "sm:col-span-2"
                  : offer.size === "tall"
                    ? "sm:row-span-2"
                    : "";

            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={
                  inView
                    ? {
                        opacity: 1,
                        scale: 1,
                      }
                    : {}
                }
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className={`group relative min-h-[320px] overflow-hidden rounded-2xl sm:min-h-[300px] ${sizeClass}`}
              >
                {/* Background Image */}
                <img
                  src={offer.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Base Overlay */}
                <div className="absolute inset-0 bg-black/35 transition-all duration-500 group-hover:bg-black/45" />

                {/* Accent Gradient */}
                <div
                  className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-75"
                  style={{
                    background: `linear-gradient(135deg, ${offer.accent}55 0%, transparent 65%)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-between p-5 sm:min-h-[300px] sm:p-6 lg:p-7">
                  {/* Top */}
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="rounded-full border border-white/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md"
                      style={{
                        backgroundColor: `${offer.accent}CC`,
                      }}
                    >
                      {offer.badge}
                    </span>

                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
                      style={{
                        boxShadow: `0 0 0 1px ${offer.accent}55`,
                      }}
                    >
                      {IconMap[offer.id]}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="mt-auto pt-12">
                    <h3 className="max-w-xl text-2xl font-bold leading-tight text-white sm:text-3xl">
                      {offer.title}
                    </h3>

                    <p className="mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
                      {offer.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-6">
                    <Link
                      href="/products"
                      className="group/cta inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1B263B] transition-all duration-300 hover:bg-[#C88A3D] hover:text-white"
                    >
                      {offer.cta}

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover/cta:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}