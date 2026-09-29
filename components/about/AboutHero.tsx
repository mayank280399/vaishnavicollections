import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="relative bg-[#0B1F3A] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#C9A227]/20" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-[#C9A227]/10" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
        <div>
          <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
            <span className="h-px w-10 bg-[#C9A227]" />
            Our Story
          </div>

          <h1 className="max-w-3xl font-serif text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
            From a small idea at home
            <span className="block text-[#C9A227]">
              to a store built around trust.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            Vaishnavi Collections began in 2024 with two varieties of
            bedsheets and a simple thought: good products should be available
            at prices that make sense.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-[#C9A227] px-6 py-3.5 text-sm font-semibold text-[#0B1F3A] transition hover:bg-[#D8B63A]"
            >
              Explore Our Collection
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <div className="flex items-center gap-2 text-sm text-white/60">
              <MapPin size={16} className="text-[#C9A227]" />
              Indra Park, New Delhi
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-[2rem] border border-[#C9A227]/20" />

          <div className="relative overflow-hidden rounded-[1.75rem] bg-white/5 p-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[#102846]">
              <Image
                src="/brands/vc-exterior.png"
                alt="Vaishnavi Collections store"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
                    Our Store
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    Indra Park · New Delhi
                  </p>
                </div>

                <div className="rounded-full border border-white/20 bg-[#0B1F3A]/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                  Est. 2024
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}