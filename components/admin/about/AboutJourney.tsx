const milestones = [
  {
    year: "2024",
    title: "A Small Beginning",
    description:
      "We started from home with just two varieties of double/queen-size bedsheets.",
  },
  {
    year: "2025",
    title: "A Year of Learning",
    description:
      "Demand became extremely low, and our bedsheet sales were essentially zero. It made us understand what was missing.",
  },
  {
    year: "02 / 2026",
    title: "A New Beginning",
    description:
      "We opened our physical shop at Indira Park and began a new chapter as Vaishnavi Collections.",
  },
  {
    year: "Today",
    title: "Still Growing",
    description:
      "Our collection continues to expand with what we learn from our customers and the products we believe are worth offering.",
  },
];

export default function AboutJourney() {
  return (
    <section className="bg-[#F8F6F1] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-5xl">
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

        <div className="relative mt-16">
          <div className="absolute bottom-0 left-[22px] top-0 w-px bg-[#C9A227]/40 md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-12">
            {milestones.map((item, index) => (
              <div
                key={item.year}
                className={`relative grid items-center gap-8 md:grid-cols-2 md:gap-16 ${
                  index % 2 === 0 ? "" : "md:[&>div:first-child]:order-2"
                }`}
              >
                <div
                  className={`pl-14 md:pl-0 ${
                    index % 2 === 0
                      ? "md:text-right"
                      : "md:col-start-2 md:text-left"
                  }`}
                >
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#C9A227]">
                    {item.year}
                  </span>

                  <h3 className="mt-2 font-serif text-2xl text-[#0B1F3A] sm:text-3xl">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#0B1F3A]/60 sm:text-base">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`absolute left-[10px] top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#F8F6F1] bg-[#C9A227] md:left-1/2 md:-translate-x-1/2`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#0B1F3A]" />
                </div>

                <div className="hidden min-h-[150px] rounded-3xl border border-[#0B1F3A]/10 bg-white md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}