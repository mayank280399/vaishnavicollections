import {
  ArrowUpRight,
  BedDouble,
  Lightbulb,
  Store,
  TrendingUp,
} from "lucide-react";

const milestones = [
  {
    year: "2024",
    title: "A Small Beginning",
    description:
      "We started from home with just two varieties of double/queen-size bedsheets.",
    cardTitle: "Where it all started",
    cardText:
      "A small collection, a simple idea and a willingness to learn what people actually needed.",
    icon: BedDouble,
    label: "Our First Collection",
  },
  {
    year: "2025",
    title: "A Year of Learning",
    description:
      "Demand became extremely low, and our bedsheet sales were essentially zero. It made us understand what was missing.",
    cardTitle: "Sometimes growth starts with a question",
    cardText:
      "We realised that having good products wasn't enough. People needed a place where they could discover them.",
    icon: Lightbulb,
    label: "What We Learned",
  },
  {
    year: "02 / 2026",
    title: "A New Beginning",
    description:
      "We opened our physical shop at Indra Park and began a new chapter as Vaishnavi Collections.",
    cardTitle: "From home to a storefront",
    cardText:
      "The shop gave us the opportunity to meet new customers, understand their needs and let them see our collection for themselves.",
    icon: Store,
    label: "Indra Park · New Delhi",
  },
  {
    year: "Today",
    title: "Still Growing",
    description:
      "Our collection continues to expand with what we learn from our customers and the products we believe are worth offering.",
    cardTitle: "The journey continues",
    cardText:
      "Every new category, customer conversation and custom order teaches us something new.",
    icon: TrendingUp,
    label: "Still Learning · Still Growing",
  },
];

export default function AboutJourney() {
  return (
    <section className="bg-[#F8F6F1] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
            Our Journey
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight text-[#0B1F3A] sm:text-5xl">
            Every chapter shaped where we are today.
          </h2>

          <p className="mt-5 text-base leading-7 text-[#0B1F3A]/60">
            What started with a few bedsheets slowly became something much
            bigger.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mt-16">
          {/* Central timeline line */}
          <div className="absolute bottom-0 left-[18px] top-0 w-px bg-[#C9A227]/35 md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-14 md:space-y-20">
            {milestones.map((item, index) => {
              const Icon = item.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item.year}
                  className="relative grid items-center gap-8 md:grid-cols-2 md:gap-20"
                >
                  {/* STORY SIDE */}
                  <div
                    className={`pl-12 md:pl-0 ${
                      isEven
                        ? "md:pr-8 md:text-right"
                        : "md:col-start-2 md:row-start-1 md:pl-8"
                    }`}
                  >
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                      {item.year}
                    </span>

                    <h3 className="mt-2 font-serif text-2xl leading-tight text-[#0B1F3A] sm:text-3xl">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#0B1F3A]/60 sm:text-base">
                      {item.description}
                    </p>
                  </div>

                  {/* TIMELINE DOT */}
                  <div className="absolute left-[7px] top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-[#F8F6F1] bg-[#C9A227] md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#0B1F3A]" />
                  </div>

                  {/* DETAIL CARD */}
                  <div
                    className={`rounded-[1.75rem] border border-[#0B1F3A]/10 bg-white p-6 shadow-sm sm:p-7 ${
                      isEven
                        ? "md:col-start-2 md:row-start-1"
                        : "md:col-start-1 md:row-start-1"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A] text-[#C9A227]">
                        <Icon size={20} strokeWidth={1.6} />
                      </div>

                      <span className="rounded-full bg-[#F8F6F1] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0B1F3A]/55">
                        {item.label}
                      </span>
                    </div>

                    <h4 className="mt-7 font-serif text-xl text-[#0B1F3A] sm:text-2xl">
                      {item.cardTitle}
                    </h4>

                    <p className="mt-3 text-sm leading-7 text-[#0B1F3A]/55">
                      {item.cardText}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A227]">
                      <span className="h-px w-8 bg-[#C9A227]" />
                      Chapter {String(index + 1).padStart(2, "0")}
                      <ArrowUpRight size={13} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}