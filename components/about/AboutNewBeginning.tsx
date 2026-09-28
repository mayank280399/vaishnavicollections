import { MapPin, Store } from "lucide-react";

export default function AboutNewBeginning() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="relative order-2 lg:order-1">
          <div className="absolute -left-3 -top-3 h-full w-full rounded-[2rem] border border-[#C9A227]/30" />

          <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#0B1F3A] p-8 text-center sm:min-h-[450px]">
            <div className="absolute left-8 top-8 h-20 w-20 rounded-full border border-[#C9A227]/20" />
            <div className="absolute bottom-8 right-8 h-28 w-28 rounded-full border border-[#C9A227]/10" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C9A227]">
                February
              </p>

              <p className="mt-2 font-serif text-7xl font-medium text-white sm:text-8xl">
                2026
              </p>

              <div className="mx-auto mt-7 h-px w-20 bg-[#C9A227]" />

              <p className="mt-6 text-sm text-white/60">
                Indra Park · New Delhi
              </p>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
            <Store size={16} />
            A New Beginning
          </div>

          <h2 className="mt-5 font-serif text-4xl leading-tight text-[#0B1F3A] sm:text-5xl">
            The day our small idea became a place people could walk into.
          </h2>

          <p className="mt-6 text-base leading-8 text-[#0B1F3A]/65 sm:text-lg">
            In February 2026, we opened our physical shop at{" "}
            <strong className="font-semibold text-[#0B1F3A]">
              Indra Park
            </strong>
            .
          </p>

          <p className="mt-5 text-base leading-8 text-[#0B1F3A]/65 sm:text-lg">
            With the shop came a new identity as well —{" "}
            <strong className="font-semibold text-[#0B1F3A]">
              Vaishnavi Collections
            </strong>
            , a name inspired by Goddess Vaishnavi.
          </p>

          <p className="mt-5 text-base leading-8 text-[#0B1F3A]/65 sm:text-lg">
            Opening the shop gave us something we didn't have while working
            from home: the opportunity to meet new customers, understand what
            they were looking for and let people see our products for
            themselves.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#0B1F3A]/10 bg-[#F8F6F1] px-4 py-2.5 text-sm text-[#0B1F3A]/70">
            <MapPin size={16} className="text-[#C9A227]" />
            Indra Park, New Delhi
          </div>
        </div>
      </div>
    </section>
  );
}