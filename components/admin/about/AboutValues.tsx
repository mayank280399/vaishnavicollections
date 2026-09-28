import {
  BadgeCheck,
  HeartHandshake,
  IndianRupee,
  Sparkles,
} from "lucide-react";

const values = [
  {
    number: "01",
    title: "Genuine Products",
    text: "We want to offer products that are genuine and worth buying.",
    icon: BadgeCheck,
  },
  {
    number: "02",
    title: "Reasonable Prices",
    text: "Our aim is to keep prices affordable and avoid unnecessary extra costs wherever possible.",
    icon: IndianRupee,
  },
  {
    number: "03",
    title: "Worth the Quality",
    text: "We don't want a product to simply look affordable. We want the quality to feel worth what you have paid for it.",
    icon: Sparkles,
  },
  {
    number: "04",
    title: "Growing With Our Customers",
    text: "Our customers help us understand what products and categories we should bring next.",
    icon: HeartHandshake,
  },
];

export default function AboutValues() {
  return (
    <section className="bg-[#F8F6F1] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
            What We Stand For
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight text-[#0B1F3A] sm:text-5xl">
            Simple things we want customers to expect from us.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div
                key={value.number}
                className="group rounded-3xl border border-[#0B1F3A]/10 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#C9A227]/40 sm:p-8"
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-bold tracking-[0.2em] text-[#C9A227]">
                    {value.number}
                  </span>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B1F3A] text-[#C9A227]">
                    <Icon size={18} strokeWidth={1.7} />
                  </div>
                </div>

                <h3 className="mt-8 font-serif text-2xl text-[#0B1F3A]">
                  {value.title}
                </h3>

                <p className="mt-3 max-w-lg text-sm leading-7 text-[#0B1F3A]/60 sm:text-base">
                  {value.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}