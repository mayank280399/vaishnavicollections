"use client";

import { Download, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InventoryHeaderProps {
  onAdjustStock?: () => void;
  onExport?: () => void;
}

export function InventoryHeader({
  onAdjustStock,
  onExport,
}: InventoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Inventory
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your products, stock levels and inventory movement.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-9"
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>

        <Button
          type="button"
          className="h-9"
          onClick={onAdjustStock}
        >
          <PackagePlus className="mr-2 h-4 w-4" />
          Adjust Stock
        </Button>
      </div>
    </div>
  );
}