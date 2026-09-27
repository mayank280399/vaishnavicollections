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
          HERO CAROUSEL
      ========================================================== */}

      <div
        className="
          relative
          h-[420px]
          w-full
          overflow-hidden
          sm:h-[500px]
          md:h-[560px]
          lg:h-[620px]
          xl:h-[660px]
        "
      >
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
          >
            {/* =====================================================
                IMAGE
            ====================================================== */}

            <div className="absolute inset-0 overflow-hidden">
              <motion.img
                src={slide.image}
                alt=""
                draggable={false}
                className="
                  h-full
                  w-full
                  object-cover
                  object-[68%_center]
                  sm:object-[70%_center]
                  lg:object-right
                "
                initial={{
                  scale: 1.08,
                  filter: "blur(3px)",
                }}
                animate={{
                  scale: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: 1.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />

              {/* LEFT TEXT READABILITY */}

              <div
                className="
                  absolute
                  inset-0
                  bg-[linear-gradient(90deg,rgba(7,26,53,0.88)_0%,rgba(7,26,53,0.68)_35%,rgba(7,26,53,0.20)_70%,rgba(7,26,53,0)_100%)]
                  sm:bg-[linear-gradient(90deg,rgba(7,26,53,0.82)_0%,rgba(7,26,53,0.62)_28%,rgba(7,26,53,0.25)_55%,rgba(7,26,53,0)_78%)]
                "
              />

              {/* BOTTOM READABILITY */}

              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  h-32
                  bg-[linear-gradient(to_top,rgba(7,26,53,0.70)_0%,rgba(7,26,53,0.35)_45%,rgba(7,26,53,0)_100%)]
                  sm:h-40
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
                px-5
                pb-14
                pt-8
                sm:px-6
                sm:pb-16
                sm:pt-10
                md:px-8
                md:pb-20
                md:pt-12
                lg:px-10
                lg:pb-24
              "
            >
              <div
                className="
                  w-full
                  max-w-[430px]
                  text-white
                  sm:max-w-[520px]
                  md:max-w-[600px]
                  lg:max-w-[680px]
                "
              >
                {/* =================================================
                    BADGE
                ================================================== */}

                <motion.div
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
                    delay: 0.15,
                  }}
                  className="
                    mb-3
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-[#D4AF37]/50
                    bg-[#071A35]/50
                    px-3
                    py-1.5
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-[#E4C76A]
                    backdrop-blur-sm
                    sm:mb-4
                    sm:px-4
                    sm:py-2
                    sm:text-xs
                  "
                >
                  {slide.badge}
                </motion.div>

                {/* =================================================
                    SUBTITLE
                    Mobile and desktop versions
                ================================================== */}

                <motion.p
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
                    delay: 0.25,
                  }}
                  className="
                    mb-2
                    text-xs
                    font-medium
                    tracking-wide
                    text-white/85
                    sm:mb-3
                    sm:text-sm
                    md:text-base
                  "
                >
                  {/* Mobile */}
                  <span className="sm:hidden">
                    {slide.mobileSubtitle}
                  </span>

                  {/* Desktop */}
                  <span className="hidden sm:inline">
                    {slide.subtitle}
                  </span>
                </motion.p>

                {/* =================================================
                    TITLE
                    Mobile and desktop versions
                ================================================== */}

                <motion.h1
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
                    delay: 0.3,
                  }}
                  className="
                    max-w-[390px]
                    text-3xl
                    font-bold
                    leading-[1.08]
                    tracking-tight
                    text-white
                    sm:max-w-[500px]
                    sm:text-4xl
                    md:max-w-[600px]
                    md:text-5xl
                    lg:max-w-[680px]
                    lg:text-6xl
                    xl:text-7xl
                  "
                >
                  {/* =================================================
                      MOBILE TITLE
                  ================================================== */}

                  <span className="sm:hidden">
                    {slide.mobileTitle.split("\n").map((line, i) => (
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

                  {/* =================================================
                      DESKTOP TITLE
                  ================================================== */}

                  <span className="hidden sm:inline">
                    {slide.title.split("\n").map((line, i) => (
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
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4,
                  }}
                  className="
                    mt-3
                    max-w-[390px]
                    text-xs
                    leading-relaxed
                    text-white/85
                    sm:mt-4
                    sm:max-w-[500px]
                    sm:text-sm
                    md:text-base
                  "
                >
                  {slide.description}
                </motion.p>

                {/* =================================================
                    CTA BUTTONS
                ================================================== */}

                <motion.div
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
                    delay: 0.5,
                  }}
                  className="
                    mt-5
                    flex
                    flex-wrap
                    gap-2.5
                    sm:mt-6
                    sm:gap-3
                  "
                >
                  <Link
                    href={slide.ctaLink}
                    className="
                      group
                      inline-flex
                      min-h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#D4AF37]
                      px-5
                      py-2.5
                      text-xs
                      font-semibold
                      text-[#071A35]
                      shadow-lg
                      shadow-black/20
                      transition-all
                      duration-200
                      hover:bg-[#E4C76A]
                      hover:shadow-xl
                      sm:min-h-12
                      sm:px-6
                      sm:py-3
                      sm:text-sm
                    "
                  >
                    {slide.cta}

                    <ArrowRight
                      size={17}
                      className="
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                      "
                    />
                  </Link>

                  <Link
                    href="/products"
                    className="
                      inline-flex
                      min-h-11
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-white/40
                      bg-white/10
                      px-5
                      py-2.5
                      text-xs
                      font-semibold
                      text-white
                      backdrop-blur-md
                      transition-all
                      duration-200
                      hover:border-white
                      hover:bg-white
                      hover:text-[#071A35]
                      sm:min-h-12
                      sm:px-6
                      sm:py-3
                      sm:text-sm
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
            px-5
            pb-4
            sm:px-6
            sm:pb-5
            md:px-8
            lg:px-10
            lg:pb-6
          "
        >
          {/* DOTS */}

          <div
            className="flex items-center gap-1.5"
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
                  h-6
                  items-center
                  justify-center
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
                        ? "h-1.5 w-7 bg-[#D4AF37]"
                        : "h-1.5 w-1.5 bg-white/60 group-hover:bg-white"
                    }
                  `}
                />
              </button>
            ))}
          </div>

          {/* NAVIGATION */}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                bg-[#071A35]/40
                text-white
                backdrop-blur-md
                transition-all
                hover:border-[#D4AF37]
                hover:bg-[#071A35]/70
                hover:text-[#D4AF37]
                sm:h-10
                sm:w-10
              "
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                bg-[#071A35]/40
                text-white
                backdrop-blur-md
                transition-all
                hover:border-[#D4AF37]
                hover:bg-[#071A35]/70
                hover:text-[#D4AF37]
                sm:h-10
                sm:w-10
              "
            >
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying((value) => !value)}
              aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
              className="
                hidden
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                bg-[#071A35]/40
                text-white
                backdrop-blur-md
                transition-all
                hover:border-[#D4AF37]
                hover:bg-[#071A35]/70
                hover:text-[#D4AF37]
                sm:flex
                sm:h-10
                sm:w-10
              "
            >
              {isPlaying ? (
                <Pause size={15} />
              ) : (
                <Play size={15} />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}