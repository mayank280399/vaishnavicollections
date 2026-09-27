import { PackageSearch } from "lucide-react";

interface InventoryEmptyStateProps {
  title?: string;
  description?: string;
}

export function InventoryEmptyState({
  title = "No inventory found",
  description = "Try changing your search or filters.",
}: InventoryEmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
      <div className="rounded-full bg-slate-100 p-3">
        <PackageSearch className="h-6 w-6 text-slate-500" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}