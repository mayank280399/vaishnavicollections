"use client";

import { Download, PackagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface InventoryBulkActionsProps {
  selectedCount: number;
  onClear: () => void;
  onAdjustStock?: () => void;
  onExport?: () => void;
}

export function InventoryBulkActions({
  selectedCount,
  onClear,
  onAdjustStock,
  onExport,
}: InventoryBulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-900">
          {selectedCount} selected
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onAdjustStock}
        >
          <PackagePlus className="mr-2 h-4 w-4" />
          Adjust Stock
        </Button>
      </div>
    </div>
  );
}