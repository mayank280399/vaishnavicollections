"use client";

import React from "react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CallToAction from "@/components/CallToAction/CallToAction";
import { motion } from "framer-motion";
import { team, stats } from "@/lib/data";
import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="w-full overflow-hidden">
        {/* =========================================================
            HERO SECTION
        ========================================================== */}
        <section className="relative flex min-h-[560px] items-center overflow-hidden bg-[#1B263B] px-4 py-24 text-white sm:px-6 sm:py-28 lg:min-h-[620px] lg:px-8">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#C88A3D]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

          <div className="relative mx-auto w-full max-w-7xl">
            <motion.div
              className="max-w-3xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="mb-5 inline-flex items-center rounded-full border border-[#C88A3D]/30 bg-[#C88A3D]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C88A3D]">
                Our Story
              </span>

              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Curating Spaces
                <br />
                <span className="text-[#C88A3D]">with Purpose.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                Founded in 2020, Vaishnavi Collections began as a small studio
                with a simple mission: to bridge the gap between high-end
                design and everyday accessibility.
              </p>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
            VISION SECTION
        ========================================================== */}
        <section className="bg-[#F8F7F4] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              {/* Content */}
              <div>
                <span className="mb-4 inline-flex items-center rounded-full bg-[#C88A3D]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#C88A3D]">
                  Our Vision
                </span>

                <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#1B263B] sm:text-4xl lg:text-5xl">
                  Quality is our
                  <br />
                  <span className="text-[#C88A3D]">
                    fundamental belief.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-[#1B263B]/65 sm:text-lg sm:leading-8">
                  We work directly with master artisans and sustainable
                  manufacturers to bring you pieces that aren&apos;t just
                  beautiful, but built to last for generations to come.
                </p>

                {/* Stats */}
                <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[#1B263B]/10 pt-8 sm:grid-cols-3">
                  {stats.map((stat, i) => (
                    <div key={i}>
                      <h3 className="text-3xl font-bold text-[#1B263B] sm:text-4xl">
                        {stat.value}
                        {stat.suffix}
                      </h3>

                      <p className="mt-2 text-sm leading-5 text-[#1B263B]/55">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#1B263B] shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop"
                    alt="Quality Craftsmanship"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B263B]/30 to-transparent" />
                </div>

                {/* Decorative gold element */}
                <div className="absolute -bottom-5 -left-5 -z-0 h-24 w-24 rounded-2xl bg-[#C88A3D]" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            TEAM SECTION
        ========================================================== */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            {/* Header */}
            <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
              <span className="mb-4 inline-flex items-center rounded-full bg-[#C88A3D]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#C88A3D]">
                The Minds Behind
              </span>

              <h2 className="text-3xl font-bold tracking-tight text-[#1B263B] sm:text-4xl lg:text-5xl">
                Meet Our Team
              </h2>

              <p className="mt-4 text-base leading-7 text-[#1B263B]/60 sm:text-lg">
                A diverse group of designers, engineers, and creatives
                working together from our New York headquarters.
              </p>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member, i) => (
                <motion.div
                  key={i}
                  className="group text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  {/* Avatar */}
                  <div className="relative mx-auto aspect-square w-full max-w-[260px] overflow-hidden rounded-2xl bg-[#F8F7F4]">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 260px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1B263B]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  {/* Name */}
                  <h3 className="mt-5 text-lg font-semibold text-[#1B263B] sm:text-xl">
                    {member.name}
                  </h3>

                  {/* Role */}
                  <p className="mt-1 text-sm text-[#C88A3D]">
                    {member.role}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <CallToAction />
      </main>

      <Footer />
    </>
  );
}