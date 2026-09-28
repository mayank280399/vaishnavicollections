import {
  HeartHandshake,
  Scissors,
  Sparkles,
} from "lucide-react";

export default function AboutMadeByUs() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0B1F3A] p-8 sm:p-12">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#C9A227]/20" />

          <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full border border-[#C9A227]/10" />

          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C9A227]/30 text-[#C9A227]">
              <Scissors size={25} strokeWidth={1.5} />
            </div>

            <p className="mt-12 text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
              Made By Us
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
              Some things are made with our own hands.
            </h2>

            <div className="mt-10 flex gap-4 border-t border-white/10 pt-7">
              <Sparkles
                size={19}
                className="mt-1 shrink-0 text-[#C9A227]"
              />

              <p className="text-sm leading-7 text-white/60">
                Selected custom orders prepared with time, care and attention
                to what the customer actually wants.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-base leading-8 text-[#0B1F3A]/65 sm:text-lg">
            Our journey isn't only about buying and selling products.
          </p>

          <p className="mt-6 text-base leading-8 text-[#0B1F3A]/65 sm:text-lg">
            Some of our products are created by us ourselves.
          </p>

          <p className="mt-6 text-base leading-8 text-[#0B1F3A]/65 sm:text-lg">
            After the shop closes, or whenever there are no customers in the
            store, we work on selected custom orders, including{" "}
            <strong className="text-[#0B1F3A]">
              cushion covers, Laddu Gopal dresses and pagdis.
            </strong>
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {["Cushion Covers", "Laddu Gopal Dresses", "Pagdis"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#0B1F3A]/10 bg-[#F8F6F1] px-4 py-4 text-sm font-medium text-[#0B1F3A]"
                >
                  {item}
                </div>
              )
            )}
          </div>

          <div className="mt-9 flex gap-4 rounded-2xl bg-[#F8F6F1] p-5">
            <HeartHandshake
              size={21}
              className="mt-1 shrink-0 text-[#C9A227]"
            />

            <p className="text-sm leading-7 text-[#0B1F3A]/65">
              It takes extra time and effort, but we enjoy creating something
              according to what a customer actually wants. For us, that's one
              of the special parts of running Vaishnavi Collections.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}