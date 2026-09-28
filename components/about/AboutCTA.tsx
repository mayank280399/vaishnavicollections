import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutCTA() {
  return (
    <section className="bg-[#F8F6F1] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mx-auto mb-8 flex items-center justify-center gap-4">
          <span className="h-px w-16 bg-[#C9A227]" />
          <span className="h-2 w-2 rotate-45 bg-[#C9A227]" />
          <span className="h-px w-16 bg-[#C9A227]" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A227]">
          Our Story Continues
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight text-[#0B1F3A] sm:text-5xl lg:text-6xl">
          From our home to our shop,
          <span className="block text-[#C9A227]">
            and now towards something bigger.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#0B1F3A]/60 sm:text-lg">
          Today, we are working to earn the trust of every new customer while
          continuing to value the customers who have already been part of our
          journey.
        </p>

        <p className="mt-8 font-serif text-xl text-[#0B1F3A] sm:text-2xl">
          This is the journey of Vaishnavi Collections.
        </p>

        <Link
          href="/products"
          className="group mt-9 inline-flex items-center gap-2 rounded-full bg-[#0B1F3A] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#132D4F]"
        >
          Explore Our Collection
          <ArrowRight
            size={17}
            className="text-[#C9A227] transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}