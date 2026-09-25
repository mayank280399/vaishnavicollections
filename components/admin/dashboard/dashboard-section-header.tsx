"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

type DashboardSectionHeaderProps = {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewDetailsHref?: string;
};

export function DashboardSectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewDetailsHref,
}: DashboardSectionHeaderProps) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-gray-900">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {viewAllHref && (
          <Link
            href={viewAllHref}
             className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 transition-colors hover:text-purple-700"         
          >
            View all
          </Link>
        )}

        {viewDetailsHref && (
          <Link
            href={viewDetailsHref}
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 transition-colors hover:text-purple-700"
          >
            View details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}