"use client";

import {
  FolderTree,
  Package,
  CircleCheck,
} from "lucide-react";

interface CategoriesStatsProps {
  total: number;
  active: number;
  products: number;
}

export function CategoriesStats({
  total,
  active,
  products,
}: CategoriesStatsProps) {
  const stats = [
    {
      label: "Categories",
      value: total,
      icon: FolderTree,
    },
    {
      label: "Active",
      value: active,
      icon: CircleCheck,
    },
    {
      label: "Products",
      value: products,
      icon: Package,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border bg-background p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {stat.label}
                </p>

                <p className="mt-0.5 text-xl font-semibold">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}