import { House } from "lucide-react";

export default function AboutHomeBeginning() {
  return (
    <section className="bg-[#0B1F3A] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C9A227]/30 text-[#C9A227]">
            <House size={25} strokeWidth={1.5} />
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
            Starting From Home
          </p>

          <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
            We had products to offer.
            <span className="block text-[#C9A227]">
              We just needed a place to show them.
            </span>
          </h2>
        </div>

        <div className="max-w-2xl lg:ml-auto">
          <p className="text-base leading-8 text-white/70 sm:text-lg">
            For a long time, we operated from our home. People who knew us —
            especially relatives and existing connections — were aware of our
            products, but reaching new customers was difficult.
          </p>

          <p className="mt-6 text-base leading-8 text-white/70 sm:text-lg">
            We had products to offer, but we didn't have a proper place where
            someone could simply walk in, see the collection and choose what
            they liked.
          </p>

          <div className="my-8 h-px w-full bg-white/10" />

          <p className="text-base leading-8 text-white/70 sm:text-lg">
            In 2025, there was almost no demand for our bedsheets, and our
            sales were essentially zero.
          </p>

          <p className="mt-6 font-serif text-2xl leading-relaxed text-white sm:text-3xl">
            Instead of giving up, we understood what we were missing.
          </p>

          <p className="mt-4 text-lg font-semibold text-[#C9A227] sm:text-xl">
            We needed to bring our products closer to people.
          </p>
        </div>
      </div>
    </section>
  );
}