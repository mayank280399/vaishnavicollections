"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Quote,
} from "lucide-react";
import { testimonials } from "@/lib/data";
import Image from "next/image";

/**
 * Replace this with your actual Google Business Profile review URL
 * if you have the direct GBP / Google Maps place URL.
 *
 * This Maps search URL is safe as a fallback and opens the
 * Vaishnavi Collections listing/search on Google Maps.
 */
 const GOOGLE_BUSINESS_PROFILE_URL =
  "https://www.google.com/maps/search/?api=1&query=Vaishnavi%20Collections%2C%20Gali%20No.%2032%2C%20Indira%20Park%2C%20Kailash%20Puri%2C%20Palam%2C%20New%20Delhi%2C%20Delhi%20110046";

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function Avatar({
  name,
  avatar,
  size = "normal",
}: {
  name: string;
  avatar?: string;
  size?: "small" | "normal" | "large";
}) {
  const sizeClasses = {
    small: "h-11 w-11 text-sm",
    normal: "h-14 w-14 text-base",
    large: "h-16 w-16 text-lg",
  };

  if (avatar?.trim()) {
    return (
      <div
        className={`${sizeClasses[size]} shrink-0 overflow-hidden rounded-full border-2 border-[#D4AF37]/60 bg-[#071A35]`}
      >
        <Image
          src={avatar}
          alt={name}
          className="h-full w-full object-cover"
          width={56}
          height={56}
        />
      </div>
    );
  }

  return (
    <div
      aria-label={`${name} initials`}
      className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full border-2 border-[#D4AF37]/50 bg-gradient-to-br from-[#071A35] to-[#102B50] font-bold tracking-wide text-[#D4AF37] shadow-sm`}
    >
      {getInitials(name)}
    </div>
  );
}

function RatingStars({
  rating,
  size = 17,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          strokeWidth={1.5}
          className={
            index < rating
              ? "fill-[#D4AF37] text-[#D4AF37]"
              : "text-[#D4AF37]/25"
          }
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const go = (dir: number) => {
    setDirection(dir);

    setCurrent(
      (c) => (c + dir + testimonials.length) % testimonials.length
    );
  };

  const selectTestimonial = (index: number) => {
    if (index === current) return;

    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const t = testimonials[current];

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 45 : -45,
      opacity: 0,
      scale: 0.98,
    }),

    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },

    exit: (d: number) => ({
      x: d > 0 ? -45 : 45,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <section
      ref={ref}
      aria-labelledby="customer-reviews-heading"
      className="relative w-full overflow-hidden bg-[#F7F5EF] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24"
    >
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#D4AF37]/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#071A35]/8 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl">
        {/* =========================================================
            TOP TRUST STRIP
        ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 flex justify-center sm:mb-12"
        >
          <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-[#D4AF37]/30 bg-white px-4 py-2.5 shadow-sm sm:px-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#071A35]">
              <CheckCircle2
                size={16}
                className="text-[#D4AF37]"
                strokeWidth={2.5}
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#071A35]">
                Google Reviews
              </p>

              <p className="truncate text-[11px] text-gray-500 sm:text-xs">
                Genuine feedback from our customers
              </p>
            </div>

            <RatingStars rating={5} size={14} />
          </div>
        </motion.div>

        {/* =========================================================
            SECTION HEADER
        ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-12 lg:mb-14"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#8A6A00]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
            Customer Love
          </span>

          <h2
            id="customer-reviews-heading"
            className="text-3xl font-bold tracking-tight text-[#071A35] sm:text-4xl lg:text-5xl"
          >
            What Our Customers Say
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
            Real reviews from customers who have shopped with
            <span className="font-semibold text-[#071A35]">
              {" "}
              Vaishnavi Collections.
            </span>
          </p>

          <div className="mx-auto mt-5 h-px w-16 bg-[#D4AF37]" />
        </motion.div>

        {/* =========================================================
            REVIEWS AREA
        ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.6,
            delay: 0.15,
          }}
          className="grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-7"
        >
          {/* =====================================================
              CUSTOMER SELECTOR
          ===================================================== */}
          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between lg:mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#071A35]/60">
                Customer Reviews
              </p>

              <span className="text-xs font-medium text-gray-400">
                {current + 1} / {testimonials.length}
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {testimonials.map((testimonial, i) => {
                const active = i === current;

                return (
                  <button
                    key={testimonial.id}
                    type="button"
                    onClick={() => selectTestimonial(i)}
                    aria-current={active ? "true" : undefined}
                    className={`group relative flex min-w-[220px] items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-300 lg:min-w-0 ${
                      active
                        ? "border-[#D4AF37]/50 bg-[#071A35] shadow-lg shadow-[#071A35]/10"
                        : "border-gray-200/80 bg-white/75 hover:border-[#D4AF37]/40 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    {/* Active gold indicator */}
                    {active && (
                      <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#D4AF37]" />
                    )}

                    <Avatar
                      name={testimonial.name}
                      avatar={testimonial.avatar}
                      size="small"
                    />

                    <div className="min-w-0 flex-1">
                      <strong
                        className={`block truncate text-sm font-semibold transition-colors ${
                          active
                            ? "text-white"
                            : "text-[#071A35] group-hover:text-[#071A35]"
                        }`}
                      >
                        {testimonial.name}
                      </strong>

                      <div className="mt-1">
                        <RatingStars
                          rating={testimonial.rating}
                          size={12}
                        />
                      </div>
                    </div>

                    {active && (
                      <ChevronRight
                        size={16}
                        className="shrink-0 text-[#D4AF37]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =====================================================
              MAIN REVIEW CARD
          ===================================================== */}
          <div className="min-w-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.article
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="relative min-h-[370px] overflow-hidden rounded-[28px] border border-[#D4AF37]/20 bg-[#071A35] p-6 shadow-xl shadow-[#071A35]/10 sm:min-h-[390px] sm:p-8 md:p-10 lg:min-h-[420px] lg:p-12"
              >
                {/* Decorative gold glow */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />

                {/* Decorative pattern */}
                <div className="pointer-events-none absolute right-5 top-5 opacity-[0.08] sm:right-8 sm:top-8">
                  <Quote
                    size={130}
                    strokeWidth={1}
                    className="text-[#D4AF37]"
                  />
                </div>

                {/* Top row */}
                <div className="relative flex items-center justify-between gap-4">
                  <div className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">
                      Google Review
                    </span>
                  </div>

                  <RatingStars rating={t.rating} size={17} />
                </div>

                {/* Review */}
                <blockquote className="relative mt-8 max-w-3xl text-xl font-medium leading-[1.55] tracking-tight text-white sm:mt-9 sm:text-2xl sm:leading-[1.5] lg:text-[28px] lg:leading-[1.5]">
                  <span className="text-[#D4AF37]">&ldquo;</span>
                  {t.text}
                  <span className="text-[#D4AF37]">&rdquo;</span>
                </blockquote>

                {/* Author */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-4 sm:bottom-8 sm:left-8 sm:right-8 md:bottom-10 md:left-10 md:right-10 lg:bottom-12 lg:left-12 lg:right-12">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={t.name}
                      avatar={t.avatar}
                      size="normal"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white sm:text-base">
                        {t.name}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5">
                        <CheckCircle2
                          size={13}
                          className="shrink-0 text-[#D4AF37]"
                          strokeWidth={2.5}
                        />

                        <span className="text-xs text-white/55">
                          Verified customer review
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gold accent */}
                  <div className="hidden h-10 w-px bg-[#D4AF37]/30 sm:block" />
                </div>
              </motion.article>
            </AnimatePresence>

            {/* ===================================================
                CONTROLS
            =================================================== */}
            <div className="mt-5 flex items-center justify-between gap-4">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((testimonial, i) => (
                  <button
                    key={testimonial.id}
                    type="button"
                    onClick={() => selectTestimonial(i)}
                    aria-label={`View review from ${testimonial.name}`}
                    aria-current={i === current ? "true" : undefined}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-7 bg-[#D4AF37]"
                        : "w-2 bg-[#071A35]/20 hover:bg-[#071A35]/40"
                    }`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#071A35]/10 bg-white text-[#071A35] shadow-sm transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#071A35] hover:text-[#D4AF37] active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#071A35]/10 bg-white text-[#071A35] shadow-sm transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#071A35] hover:text-[#D4AF37] active:scale-95"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================
            GOOGLE CTA
        ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.6,
            delay: 0.35,
          }}
          className="mt-10 flex justify-center sm:mt-12"
        >
          <a
            href={GOOGLE_BUSINESS_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#071A35] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#071A35]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#102B50] hover:shadow-xl sm:w-auto sm:px-7"
          >
            <span>Read All Reviews on Google</span>

            <ExternalLink
              size={16}
              className="text-[#D4AF37] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </motion.div>

        <p className="mt-3 text-center text-[11px] text-gray-500">
          See more customer experiences on our Google Business Profile
        </p>
      </div>
    </section>
  );
}