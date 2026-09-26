"use client";

type Tab =
  | "overview"
  | "customers"
  | "rewards"
  | "settings";

type Props = {
  value: Tab;
  onChange: (value: Tab) => void;
};

const tabs: { id: Tab; label: string }[] = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "customers",
    label: "Customers",
  },
  {
    id: "rewards",
    label: "Rewards",
  },
  {
    id: "settings",
    label: "Settings",
  },
];

export function LoyaltyTabs({
  value,
  onChange,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-xl border bg-muted/40 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              value === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}