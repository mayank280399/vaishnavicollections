"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CallToAction() {
  const containerRef = React.useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <section
      ref={containerRef}
      className="w-full px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative isolate min-h-[520px] overflow-hidden rounded-3xl bg-[#1B263B] shadow-xl sm:min-h-[560px] lg:min-h-[600px]">
          {/* Background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              style={{ y }}
              className="absolute -inset-y-16 inset-x-0 bg-[url('/cta-bg.jpg')] bg-cover bg-center bg-no-repeat"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-[#1B263B]/75" />

            {/* Gold Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1B263B]/80 via-[#1B263B]/65 to-[#C88A3D]/35" />

            {/* Glow */}
            <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C88A3D]/20 blur-[100px] sm:h-[450px] sm:w-[450px]" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex min-h-[520px] items-center justify-center px-5 py-16 text-center sm:min-h-[560px] sm:px-8 lg:min-h-[600px] lg:px-12">
            <div className="mx-auto max-w-3xl">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md sm:text-sm"
              >
                <Sparkles
                  size={14}
                  className="text-[#C88A3D]"
                />

                <span>Limited Time Opportunity</span>
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                }}
                viewport={{ once: true }}
                className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Ready to elevate
                <br />
                <span className="text-[#C88A3D]">
                  living space?
                </span>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                }}
                viewport={{ once: true }}
                className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8 lg:text-lg"
              >
                Join 50,000+ interior enthusiasts and start your journey with
                a 10% discount on your first order.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                }}
                viewport={{ once: true }}
                className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row"
              >
                {/* Primary */}
                <Link
                  href="/products"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C88A3D] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all duration-300 hover:bg-[#B77830] hover:shadow-xl sm:w-auto sm:px-7"
                >
                  Explore Collection

                  <ArrowRight
                    size={20}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                {/* Secondary */}
                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20 sm:w-auto sm:px-7"
                >
                  Talk to a Stylist
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            {/* Floating Gold Orb */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-10 top-1/4 h-28 w-28 rounded-full border border-[#C88A3D]/30 bg-[#C88A3D]/10 blur-sm sm:left-[5%] sm:h-40 sm:w-40"
            />

            {/* Floating White Orb */}
            <motion.div
              animate={{
                y: [0, 20, 0],
                x: [0, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -right-8 bottom-1/4 h-24 w-24 rounded-full border border-white/15 bg-white/10 blur-sm sm:right-[8%] sm:h-36 sm:w-36"
            />
          </div>
        </div>
      </div>
    </section>
  );
}