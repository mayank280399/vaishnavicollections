"use client";

import type { ReactNode } from "react";

interface SettingsSectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSectionCard({
  title,
  description,
  children,
}: SettingsSectionCardProps) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}