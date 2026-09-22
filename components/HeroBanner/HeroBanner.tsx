"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { slides } from "@/lib/data";

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(1);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const startAuto = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setDirection(1);

      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    if (isPlaying) {
      startAuto();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying]);

  const go = (dir: number) => {
    setDirection(dir);

    setCurrent(
      (c) => (c + dir + slides.length) % slides.length
    );

    if (isPlaying) {
      startAuto();
    }
  };

  const slide = slides[current];

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? "100%" : "-100%",
      opacity: 0,
    }),

    center: {
      x: 0,
      opacity: 1,
    },

    exit: (d: number) => ({
      x: d > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <section
      aria-label="Featured banner"
      className="relative w-full overflow-hidden"
    >
      {/* =========================================================
          Slider
          ========================================================= */}
      <div className="relative h-[620px] w-full overflow-hidden sm:h-[620px] md:h-[650px] lg:h-[680px] xl:h-[700px]">
        <AnimatePresence
          mode="popLayout"
          custom={direction}
        >
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.65,
              ease: [0.76, 0, 0.24, 1],
            }}
            className="absolute inset-0 h-full w-full overflow-hidden"
            style={{
              background: slide.bg,
            }}
          >
            {/* =====================================================
                Background Image
                ===================================================== */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.img
                src={slide.image}
                alt=""
                className="h-full w-full object-cover object-center"
                initial={{
                  scale: 1.15,
                  filter: "blur(4px)",
                }}
                animate={{
                  scale: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: 1.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />

              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-black/35" />

              {/* Left-to-right gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* =====================================================
                Content
                ===================================================== */}
            <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center px-5 pb-20 pt-16 sm:px-6 md:px-8 lg:px-10 lg:pb-24">
              <div className="w-full max-w-2xl text-white lg:max-w-3xl">
                {/* Badge */}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.25,
                    duration: 0.5,
                  }}
                  className="mb-5 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:mb-6 sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  {slide.badge}
                </motion.div>

                {/* Subtitle */}
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.3,
                    duration: 0.5,
                  }}
                  className="mb-3 max-w-xl text-sm font-medium tracking-wide text-white/85 sm:text-base md:text-lg"
                >
                  {slide.subtitle}
                </motion.p>

                {/* Title */}
                <motion.h1
                  initial={{
                    opacity: 0,
                    y: 24,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.38,
                    duration: 0.6,
                  }}
                  className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
                >
                  {slide.title.split("\n").map((line, i) => (
                    <span key={i}>
                      {i === 1 ? (
                        <span className="text-[#C88A3D]">
                          {line}
                        </span>
                      ) : (
                        line
                      )}

                      {i === 0 && <br />}
                    </span>
                  ))}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.46,
                    duration: 0.5,
                  }}
                  className="mt-5 max-w-xl text-sm leading-6 text-white/80 sm:mt-6 sm:text-base sm:leading-7 md:text-lg"
                >
                  {slide.description}
                </motion.p>

                {/* =================================================
                    CTA Buttons
                    ================================================= */}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.54,
                    duration: 0.5,
                  }}
                  className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center"
                >
                  {/* Primary CTA */}
                  <Link
                    href={slide.ctaLink}
                    className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C88A3D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all duration-200 hover:bg-[#B77830] hover:shadow-xl sm:px-7"
                  >
                    {slide.cta}

                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>

                  {/* Secondary CTA */}
                  <Link
                    href="/products"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:border-white hover:bg-white hover:text-[#1B263B] sm:px-7"
                  >
                    View All
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* =========================================================
          Controls
          ========================================================= */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 pb-5 sm:px-6 sm:pb-6 md:px-8 lg:px-10 lg:pb-7">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);

                  if (isPlaying) {
                    startAuto();
                  }
                }}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={
                  i === current ? "true" : undefined
                }
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  i === current
                    ? "w-8 bg-[#C88A3D]"
                    : "w-2 bg-white/50 hover:bg-white/80",
                ].join(" ")}
              />
            ))}
          </div>

          {/* Arrows + Play */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => go(-1)}
              className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition-all duration-200 hover:border-white/50 hover:bg-white hover:text-[#1B263B] sm:size-11"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() =>
                setIsPlaying((p) => !p)
              }
              className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition-all duration-200 hover:border-white/50 hover:bg-white hover:text-[#1B263B] sm:size-11"
              aria-label={
                isPlaying ? "Pause slideshow" : "Play slideshow"
              }
            >
              {isPlaying ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}
            </button>

            <button
              onClick={() => go(1)}
              className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition-all duration-200 hover:border-white/50 hover:bg-white hover:text-[#1B263B] sm:size-11"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}