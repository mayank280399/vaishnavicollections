"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { testimonials } from "@/lib/data";

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

  const t = testimonials[current];

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (d: number) => ({
      x: d > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.96,
    }),
  };

  return (
    <section
      ref={ref}
      className="w-full bg-[#F8F7F4] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-7xl">

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            delay: 0.2,
            duration: 0.5,
          }}
          className="mb-12 flex justify-center sm:mb-14 lg:mb-16"
        >
          <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-sm backdrop-blur-md sm:flex-row">
            {[
              ["50K+", "Happy Customers"],
              ["200+", "Curated Products"],
              ["4.9★", "Rating"],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={`flex flex-1 flex-col items-center justify-center px-5 py-5 sm:py-6 ${
                  index !== 0
                    ? "border-t border-gray-200 sm:border-l sm:border-t-0"
                    : ""
                }`}
              >
                <strong className="text-2xl font-bold tracking-tight text-[#1B263B] sm:text-3xl">
                  {value}
                </strong>

                <span className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500 sm:text-sm">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-12 lg:mb-14"
        >
          <span className="mb-4 inline-flex items-center rounded-full border border-[#C88A3D]/25 bg-[#C88A3D]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#C88A3D]">
            What Customers Say
          </span>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1B263B] sm:text-4xl lg:text-5xl">
            Loved By Thousands
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Real stories from real customers who&apos;ve transformed their
            spaces.
          </p>
        </motion.div>

        {/* Testimonials Layout */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.6,
            delay: 0.2,
          }}
          className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8"
        >

          {/* Side Customer List */}
          <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {testimonials.map((testimonial, i) => {
              const active = i === current;

              return (
                <button
                  key={testimonial.id}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className={`group flex min-w-[210px] items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 lg:min-w-0 ${
                    active
                      ? "border-[#C88A3D]/40 bg-white shadow-md"
                      : "border-transparent bg-white/50 hover:border-gray-200 hover:bg-white"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 transition-colors ${
                      active
                        ? "border-[#C88A3D]"
                        : "border-white"
                    }`}
                  >
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <strong
                      className={`block truncate text-sm font-semibold transition-colors ${
                        active
                          ? "text-[#1B263B]"
                          : "text-gray-700 group-hover:text-[#1B263B]"
                      }`}
                    >
                      {testimonial.name}
                    </strong>

                    <span className="mt-0.5 block truncate text-xs text-gray-500">
                      {testimonial.role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Testimonial */}
          <div className="min-w-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.42,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="relative min-h-[360px] overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 md:p-10 lg:min-h-[390px] lg:p-12"
              >
                {/* Decorative Quote */}
                <div className="pointer-events-none absolute right-6 top-2 select-none text-[100px] font-serif leading-none text-[#C88A3D]/10 sm:right-10 sm:text-[130px]">
                  &ldquo;
                </div>

                {/* Stars */}
                <div className="relative flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill="#C88A3D"
                      strokeWidth={0}
                      className="text-[#C88A3D]"
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="relative mt-7 max-w-3xl text-xl font-medium leading-relaxed tracking-tight text-[#1B263B] sm:text-2xl lg:text-3xl">
                  &ldquo;{t.text}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3 sm:bottom-8 sm:left-8 md:bottom-10 md:left-10 lg:bottom-12 lg:left-12">
                  <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#C88A3D]/30">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#1B263B] sm:text-base">
                      {t.name}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                      {t.role} · {t.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="mt-5 flex items-center justify-between">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > current ? 1 : -1);
                      setCurrent(i);
                    }}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-7 bg-[#C88A3D]"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#1B263B] shadow-sm transition-all duration-300 hover:border-[#C88A3D] hover:bg-[#C88A3D] hover:text-white"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={() => go(1)}
                  aria-label="Next testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#1B263B] shadow-sm transition-all duration-300 hover:border-[#C88A3D] hover:bg-[#C88A3D] hover:text-white"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}