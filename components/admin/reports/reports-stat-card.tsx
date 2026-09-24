"use client";

import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type Props = {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
};

export function ReportsStatCard({
  title,
  value,
  description,
  icon: Icon,
}: Props) {
  return (
    <Card className="rounded-2xl border shadow-none">
      <CardContent className="flex items-center gap-3 p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-1 truncate text-xl font-semibold tracking-tight">
            {value}
          </p>

          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}