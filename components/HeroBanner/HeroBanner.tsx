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

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          HERO
      ========================================================== */}

      <div
        className="
          relative
          h-[260px]
          w-full
          overflow-hidden

          xs:h-[275px]

          sm:h-[350px]

          md:h-[430px]

          lg:h-[500px]

          xl:h-[540px]
        "
      >
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.6,
              ease: [0.76, 0, 0.24, 1],
            }}
            className="
              absolute
              inset-0
              h-full
              w-full
              overflow-hidden
            "
          >
            {/* =====================================================
                IMAGE
            ====================================================== */}

            <div className="absolute inset-0 overflow-hidden">
              <motion.img
                src={slide.image}
                alt=""
                draggable={false}
                initial={{
                  scale: 1.05,
                  filter: "blur(2px)",
                }}
                animate={{
                  scale: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: 1.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="
                  h-full
                  w-full
                  object-cover
                  object-[68%_center]

                  sm:object-[70%_center]

                  md:object-[72%_center]

                  lg:object-center
                "
              />

              {/* ===================================================
                  LEFT TEXT OVERLAY
              ==================================================== */}

              <div
                className="
                  absolute
                  inset-0
                  bg-[linear-gradient(90deg,rgba(7,26,53,0.90)_0%,rgba(7,26,53,0.72)_32%,rgba(7,26,53,0.25)_65%,rgba(7,26,53,0)_100%)]
                "
              />

              {/* ===================================================
                  MOBILE BOTTOM OVERLAY
              ==================================================== */}

              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  h-24
                  bg-[linear-gradient(to_top,rgba(7,26,53,0.70),rgba(7,26,53,0))]
                  sm:h-28
                  md:h-32
                "
              />
            </div>

            {/* =====================================================
                CONTENT
            ====================================================== */}

            <div
              className="
                relative
                z-10
                mx-auto
                flex
                h-full
                w-full
                max-w-7xl
                items-center

                px-4
                pb-8
                pt-4

                sm:px-6
                sm:pb-10
                sm:pt-6

                md:px-8
                md:pb-12

                lg:px-10
                lg:pb-14
              "
            >
              <div
                className="
                  w-full
                  max-w-[270px]

                  sm:max-w-[430px]

                  md:max-w-[540px]

                  lg:max-w-[620px]
                "
              >
                {/* =================================================
                    BADGE
                ================================================== */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: 0.1,
                  }}
                  className="
                    mb-2
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-[#D4AF37]/50
                    bg-[#071A35]/55
                    px-2.5
                    py-1
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-[#E4C76A]
                    backdrop-blur-sm

                    sm:mb-3
                    sm:px-3
                    sm:py-1.5
                    sm:text-[10px]

                    md:text-xs
                  "
                >
                  {slide.badge}
                </motion.div>

                {/* =================================================
                    SUBTITLE
                ================================================== */}

                <motion.p
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: 0.18,
                  }}
                  className="
                    mb-1
                    text-[9px]
                    font-medium
                    tracking-wide
                    text-white/85

                    sm:mb-2
                    sm:text-xs

                    md:text-sm
                  "
                >
                  <span className="sm:hidden">
                    {slide.mobileSubtitle}
                  </span>

                  <span className="hidden sm:inline">
                    {slide.subtitle}
                  </span>
                </motion.p>

                {/* =================================================
                    TITLE
                ================================================== */}

                <motion.h1
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.22,
                  }}
                  className="
                    max-w-[280px]
                    text-[26px]
                    font-bold
                    leading-[1.04]
                    tracking-tight
                    text-white

                    sm:max-w-[430px]
                    sm:text-4xl

                    md:max-w-[540px]
                    md:text-5xl

                    lg:max-w-[620px]
                    lg:text-6xl

                    xl:text-7xl
                  "
                >
                  {/* MOBILE TITLE */}

                  <span className="sm:hidden">
                    {slide.mobileTitle
                      .split("\n")
                      .map((line: string, i: number) => (
                        <span key={i}>
                          {i === 1 ? (
                            <span className="text-[#D4AF37]">
                              {line}
                            </span>
                          ) : (
                            line
                          )}

                          {i === 0 && <br />}
                        </span>
                      ))}
                  </span>

                  {/* DESKTOP TITLE */}

                  <span className="hidden sm:inline">
                    {slide.title
                      .split("\n")
                      .map((line: string, i: number) => (
                        <span key={i}>
                          {i === 1 ? (
                            <span className="text-[#D4AF37]">
                              {line}
                            </span>
                          ) : (
                            line
                          )}

                          {i === 0 && <br />}
                        </span>
                      ))}
                  </span>
                </motion.h1>

                {/* =================================================
                    DESCRIPTION
                ================================================== */}

                <motion.p
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: 0.3,
                  }}
                  className="
                    mt-2
                    max-w-[280px]
                    text-[9px]
                    leading-relaxed
                    text-white/80

                    sm:mt-3
                    sm:max-w-[430px]
                    sm:text-xs

                    md:max-w-[520px]
                    md:text-sm

                    lg:text-base
                  "
                >
                  {slide.description}
                </motion.p>

                {/* =================================================
                    CTA
                ================================================== */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: 0.38,
                  }}
                  className="
                    mt-3
                    flex
                    flex-wrap
                    gap-2

                    sm:mt-4
                    sm:gap-2.5

                    md:mt-5
                    md:gap-3
                  "
                >
                  <Link
                    href={slide.ctaLink}
                    className="
                      group
                      inline-flex
                      min-h-9
                      items-center
                      justify-center
                      gap-1.5
                      rounded-lg
                      bg-[#D4AF37]
                      px-3.5
                      py-2
                      text-[10px]
                      font-semibold
                      text-[#071A35]
                      shadow-lg
                      shadow-black/20
                      transition-all
                      duration-200
                      hover:bg-[#E4C76A]
                      hover:shadow-xl

                      sm:min-h-10
                      sm:px-4
                      sm:text-xs

                      md:min-h-11
                      md:px-5
                      md:text-sm

                      lg:min-h-12
                      lg:px-6
                    "
                  >
                    {slide.cta}

                    <ArrowRight
                      size={14}
                      className="
                        transition-transform
                        duration-200
                        group-hover:translate-x-1

                        sm:h-4
                        sm:w-4
                      "
                    />
                  </Link>

                  <Link
                    href="/products"
                    className="
                      inline-flex
                      min-h-9
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-white/40
                      bg-white/10
                      px-3.5
                      py-2
                      text-[10px]
                      font-semibold
                      text-white
                      backdrop-blur-md
                      transition-all
                      duration-200
                      hover:border-white
                      hover:bg-white
                      hover:text-[#071A35]

                      sm:min-h-10
                      sm:px-4
                      sm:text-xs

                      md:min-h-11
                      md:px-5
                      md:text-sm

                      lg:min-h-12
                      lg:px-6
                    "
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
          CAROUSEL CONTROLS
      ========================================================== */}

      <div className="absolute inset-x-0 bottom-0 z-20">
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-7xl
            items-center
            justify-between

            px-4
            pb-3

            sm:px-6
            sm:pb-4

            md:px-8

            lg:px-10
            lg:pb-5
          "
        >
          {/* =====================================================
              DOTS
          ====================================================== */}

          <div
            className="flex items-center gap-1"
            role="tablist"
            aria-label="Carousel slides"
          >
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setDirection(index > current ? 1 : -1);
                  setCurrent(index);

                  if (isPlaying) {
                    startAuto();
                  }
                }}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={current === index}
                role="tab"
                className="
                  group
                  flex
                  h-5
                  items-center
                  justify-center
                  px-0.5
                "
              >
                <span
                  className={`
                    block
                    rounded-full
                    transition-all
                    duration-300

                    ${
                      current === index
                        ? "h-1 w-5 bg-[#D4AF37] sm:w-6"
                        : "h-1 w-1 bg-white/60 group-hover:bg-white"
                    }
                  `}
                />
              </button>
            ))}
          </div>

          {/* =====================================================
              NAVIGATION
          ====================================================== */}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                bg-[#071A35]/45
                text-white
                backdrop-blur-md
                transition-all
                hover:border-[#D4AF37]
                hover:bg-[#071A35]/75
                hover:text-[#D4AF37]

                sm:h-9
                sm:w-9

                md:h-10
                md:w-10
              "
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                bg-[#071A35]/45
                text-white
                backdrop-blur-md
                transition-all
                hover:border-[#D4AF37]
                hover:bg-[#071A35]/75
                hover:text-[#D4AF37]

                sm:h-9
                sm:w-9

                md:h-10
                md:w-10
              "
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                setIsPlaying((value) => !value)
              }
              aria-label={
                isPlaying
                  ? "Pause carousel"
                  : "Play carousel"
              }
              className="
                hidden
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                bg-[#071A35]/45
                text-white
                backdrop-blur-md
                transition-all
                hover:border-[#D4AF37]
                hover:bg-[#071A35]/75
                hover:text-[#D4AF37]

                sm:flex

                md:h-10
                md:w-10
              "
            >
              {isPlaying ? (
                <Pause size={14} />
              ) : (
                <Play size={14} />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}