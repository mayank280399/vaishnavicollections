"use client";

import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Package,
} from "lucide-react";
import { useState } from "react";

import type { InventoryProduct } from "@/lib/inventory/types";

interface InventoryTableProps {
  products: InventoryProduct[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onViewProduct?: (product: InventoryProduct) => void;
  onAdjustStock?: (product: InventoryProduct) => void;
  onViewHistory?: (product: InventoryProduct) => void;
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

export function InventoryTable({
  products,
  selectedIds,
  onSelectionChange,
  onViewProduct,
  onAdjustStock,
  onViewHistory,
}: InventoryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allSelected =
    products.length > 0 &&
    products.every((product) =>
      selectedIds.includes(product.id)
    );

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
      return;
    }

    onSelectionChange(products.map((product) => product.id));
  };

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
    <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/70">
            <tr className="text-left text-xs font-medium text-slate-500">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300"
                  aria-label="Select all products"
                />
              </th>

              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Online</th>
              <th className="px-4 py-3">Status</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const expanded = expandedId === product.id;

              return (
                <>
                  <tr
                    key={product.id}
                    className="transition hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() =>
                          toggleProduct(product.id)
                        }
                        className="h-4 w-4 rounded border-slate-300"
                        aria-label={`Select ${product.name}`}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          onViewProduct?.(product)
                        }
                        className="flex items-center gap-3 text-left"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
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

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate font-medium text-slate-900">
                            {product.name}
                          </p>

                          {product.variants.length > 0 && (
                            <p className="text-xs text-slate-500">
                              {product.variants.length}{" "}
                              {product.variants.length === 1
                                ? "variant"
                                : "variants"}
                            </p>
                          )}
                        </div>
                      </button>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {product.sku || "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {product.categoryName || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {product.variants.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(
                                expanded ? null : product.id
                              )
                            }
                            className="rounded p-1 hover:bg-slate-100"
                            aria-label={
                              expanded
                                ? "Collapse variants"
                                : "Expand variants"
                            }
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        <span className="font-medium text-slate-900">
                          {product.stockQuantity}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {formatCurrency(product.costPrice)}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatCurrency(product.sellingPrice)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={
                          product.onlineEnabled
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }
                      >
                        {product.onlineEnabled
                          ? "Online"
                          : "Offline"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyles(
                          product.status
                        )}`}
                      >
                        {getStatusLabel(product.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          type="button"
                          className="rounded-lg p-2 hover:bg-slate-100"
                          aria-label={`Actions for ${product.name}`}
                          onClick={() =>
                            onViewProduct?.(product)
                          }
                        >
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expanded &&
                    product.variants.length > 0 && (
                      <tr key={`${product.id}-variants`}>
                        <td
                          colSpan={10}
                          className="bg-slate-50/70 px-16 py-3"
                        >
                          <div className="rounded-lg border border-slate-200 bg-white">
                            <div className="grid grid-cols-4 border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500">
                              <span>Variant</span>
                              <span>SKU</span>
                              <span>Stock</span>
                              <span>Price</span>
                            </div>

                            {product.variants.map(
                              (variant) => (
                                <div
                                  key={variant.id}
                                  className="grid grid-cols-4 border-b border-slate-100 px-4 py-3 text-sm last:border-0"
                                >
                                  <span className="text-slate-900">
                                    {variant.name}
                                  </span>

                                  <span className="text-slate-500">
                                    {variant.sku || "—"}
                                  </span>

                                  <span className="font-medium text-slate-900">
                                    {variant.stockQuantity}
                                  </span>

                                  <span className="text-slate-700">
                                    {formatCurrency(
                                      variant.sellingPrice
                                    )}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}