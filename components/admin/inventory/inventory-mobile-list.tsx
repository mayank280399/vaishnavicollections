"use client";

import {
  ChevronRight,
  MoreHorizontal,
  Package,
} from "lucide-react";

import type { InventoryProduct } from "@/lib/inventory/types";

interface InventoryMobileListProps {
  products: InventoryProduct[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onViewProduct?: (product: InventoryProduct) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusStyles(status: InventoryProduct["status"]) {
  switch (status) {
    case "IN_STOCK":
      return "bg-emerald-50 text-emerald-700";

    case "LOW_STOCK":
      return "bg-amber-50 text-amber-700";

    case "OUT_OF_STOCK":
      return "bg-red-50 text-red-700";
  }
}

function getStatusLabel(status: InventoryProduct["status"]) {
  switch (status) {
    case "IN_STOCK":
      return "In Stock";
    case "LOW_STOCK":
      return "Low Stock";
    case "OUT_OF_STOCK":
      return "Out of Stock";
  }
}

export function InventoryMobileList({
  products,
  selectedIds,
  onSelectionChange,
  onViewProduct,
}: InventoryMobileListProps) {
  const toggleProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(
        selectedIds.filter((selectedId) => selectedId !== id)
      );
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-3 lg:hidden">
      {products.map((product) => (
        <div
          key={product.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedIds.includes(product.id)}
              onChange={() => toggleProduct(product.id)}
              className="mt-1 h-4 w-4 rounded border-slate-300"
              aria-label={`Select ${product.name}`}
            />

            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-5 w-5 text-slate-400" />
              )}
            </div>

            <button
              type="button"
              onClick={() => onViewProduct?.(product)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm font-semibold text-slate-900">
                {product.name}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {product.sku || "No SKU"}
              </p>
            </button>

            <button
              type="button"
              className="rounded-lg p-2 hover:bg-slate-100"
              aria-label={`Actions for ${product.name}`}
            >
              <MoreHorizontal className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div>
              <p className="text-xs text-slate-500">
                Stock
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {product.stockQuantity}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Price
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatCurrency(product.sellingPrice)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Category
              </p>

              <p className="mt-1 truncate text-sm text-slate-700">
                {product.categoryName || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Status
              </p>

              <span
                className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusStyles(
                  product.status
                )}`}
              >
                {getStatusLabel(product.status)}
              </span>
            </div>
          </div>

          {product.variants.length > 0 && (
            <button
              type="button"
              onClick={() => onViewProduct?.(product)}
              className="mt-3 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-slate-600"
            >
              <span>
                {product.variants.length}{" "}
                {product.variants.length === 1
                  ? "variant"
                  : "variants"}
              </span>

              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}