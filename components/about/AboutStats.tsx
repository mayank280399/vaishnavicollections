import { CalendarDays, Layers3, Store, Sparkles } from "lucide-react";

const stats = [
  {
    value: "2024",
    label: "Our Beginning",
    icon: CalendarDays,
  },
  {
    value: "2",
    label: "First Bedsheet Varieties",
    icon: Layers3,
  },
  {
    value: "2026",
    label: "Our Physical Store",
    icon: Store,
  },
  {
    value: "∞",
    label: "Still Growing",
    icon: Sparkles,
  },
];

export default function AboutStats() {
  return (
    <section className="border-b border-[#0B1F3A]/10 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-[#0B1F3A]/10 sm:grid-cols-4 sm:divide-y-0">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="group flex items-center gap-4 px-5 py-7 sm:px-7 lg:px-10 lg:py-8"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B1F3A] text-[#C9A227]">
                <Icon size={19} strokeWidth={1.7} />
              </div>

              <div>
                <p className="text-2xl font-semibold tracking-tight text-[#0B1F3A]">
                  {item.value}
                </p>

                <p className="mt-0.5 text-xs leading-5 text-[#0B1F3A]/55">
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}