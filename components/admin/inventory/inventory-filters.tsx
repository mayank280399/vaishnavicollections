"use client";

import {
  ArrowDownAZ,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterDisclosure } from "@/components/admin/filter-disclosure";

import type {
  InventoryCategory,
  InventoryFilters as InventoryFilterState,
  InventoryOnlineFilter,
  InventorySort,
  InventoryStockFilter,
} from "@/lib/inventory/types";

interface InventoryFiltersProps {
  filters: InventoryFilterState;
  categories: InventoryCategory[];

  onFiltersChange: (
    filters: InventoryFilterState
  ) => void;
}

export function InventoryFilters({
  filters,
  categories,
  onFiltersChange,
}: InventoryFiltersProps) {
  const updateFilter = <K extends keyof InventoryFilterState>(
    key: K,
    value: InventoryFilterState[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      categoryId: "ALL",
      stockStatus: "ALL",
      onlineStatus: "ALL",
      sort: "NAME_ASC",
    });
  };

  const hasFilters =
    filters.search !== "" ||
    filters.categoryId !== "ALL" ||
    filters.stockStatus !== "ALL" ||
    filters.onlineStatus !== "ALL" ||
    filters.sort !== "NAME_ASC";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <FilterDisclosure active={hasFilters} onReset={clearFilters}>
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            value={filters.search}
            onChange={(event) =>
              updateFilter("search", event.target.value)
            }
            placeholder="Search products or SKU..."
            className="h-10 pl-9 pr-9"
          />

          {filters.search && (
            <button
              type="button"
              onClick={() => updateFilter("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={filters.categoryId}
              onChange={(event) =>
                updateFilter("categoryId", event.target.value)
              }
              className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="ALL">All Categories</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filters.stockStatus}
            onChange={(event) =>
              updateFilter(
                "stockStatus",
                event.target.value as InventoryStockFilter
              )
            }
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="ALL">All Stock Status</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          <select
            value={filters.onlineStatus}
            onChange={(event) =>
              updateFilter(
                "onlineStatus",
                event.target.value as InventoryOnlineFilter
              )
            }
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="ALL">All Online Status</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>

          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={filters.sort}
              onChange={(event) =>
                updateFilter(
                  "sort",
                  event.target.value as InventorySort
                )
              }
              className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="NAME_ASC">Product Name</option>
              <option value="STOCK_LOW_HIGH">
                Stock: Low to High
              </option>
              <option value="STOCK_HIGH_LOW">
                Stock: High to Low
              </option>
              <option value="PRICE_LOW_HIGH">
                Price: Low to High
              </option>
              <option value="PRICE_HIGH_LOW">
                Price: High to Low
              </option>
              <option value="RECENTLY_UPDATED">
                Recently Updated
              </option>
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="hidden h-8 text-xs lg:inline-flex"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      </FilterDisclosure>
    </div>
  );
}
