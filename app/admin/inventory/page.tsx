"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Package,
  Search,
  SlidersHorizontal,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getInventoryProducts } from "@/lib/inventory/queries";

import type {
  InventoryCategory,
  InventoryFilters,
  InventoryOnlineFilter,
  InventoryProduct,
  InventorySort,
  InventoryStockFilter,
} from "@/lib/inventory/types";

const DEFAULT_FILTERS: InventoryFilters = {
  search: "",
  categoryId: "ALL",
  stockStatus: "ALL",
  onlineStatus: "ALL",
  sort: "NAME_ASC",
};

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [filters, setFilters] =
    useState<InventoryFilters>(DEFAULT_FILTERS);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError("");

    const result = await getInventoryProducts();

    if (result.error) {
      setError(result.error);
      setProducts([]);
    } else {
      setProducts(result.products);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const categories = useMemo<InventoryCategory[]>(() => {
    const map = new Map<string, InventoryCategory>();

    products.forEach((product) => {
      if (product.categoryId && product.categoryName) {
        map.set(product.categoryId, {
          id: product.categoryId,
          name: product.categoryName,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const search = filters.search.trim().toLowerCase();

    if (search) {
      result = result.filter((product) => {
        return (
          product.name.toLowerCase().includes(search) ||
          product.sku?.toLowerCase().includes(search) ||
          product.categoryName?.toLowerCase().includes(search)
        );
      });
    }

    if (filters.categoryId !== "ALL") {
      result = result.filter(
        (product) => product.categoryId === filters.categoryId
      );
    }

    if (filters.stockStatus !== "ALL") {
      result = result.filter(
        (product) => product.status === filters.stockStatus
      );
    }

    if (filters.onlineStatus === "ONLINE") {
      result = result.filter(
        (product) => product.onlineEnabled
      );
    }

    if (filters.onlineStatus === "OFFLINE") {
      result = result.filter(
        (product) => !product.onlineEnabled
      );
    }

    result.sort((a, b) => {
      switch (filters.sort) {
        case "STOCK_LOW_HIGH":
          return a.stockQuantity - b.stockQuantity;

        case "STOCK_HIGH_LOW":
          return b.stockQuantity - a.stockQuantity;

        case "VALUE_HIGH_LOW":
          return b.inventoryValue - a.inventoryValue;

        case "PRICE_LOW_HIGH":
          return a.sellingPrice - b.sellingPrice;

        case "PRICE_HIGH_LOW":
          return b.sellingPrice - a.sellingPrice;

        case "NAME_ASC":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [products, filters]);

  const summary = useMemo(() => {
    return {
      totalProducts: products.length,

      inStock: products.filter(
        (product) => product.status === "IN_STOCK"
      ).length,

      lowStock: products.filter(
        (product) => product.status === "LOW_STOCK"
      ).length,

      outOfStock: products.filter(
        (product) => product.status === "OUT_OF_STOCK"
      ).length,

      inventoryValue: products.reduce(
        (total, product) => total + product.inventoryValue,
        0
      ),
    };
  }, [products]);

  const hasFilters =
    filters.search !== "" ||
    filters.categoryId !== "ALL" ||
    filters.stockStatus !== "ALL" ||
    filters.onlineStatus !== "ALL" ||
    filters.sort !== "NAME_ASC";

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="mx-auto w-full space-y-5 px-4 py-5 sm:space-y-6 sm:px-5 sm:py-6 md:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Boxes className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Inventory
            </h1>

            <p className="text-sm text-muted-foreground">
              Monitor stock levels, inventory value and availability.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={loadInventory}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

          <div>
            <p className="font-medium">
              Unable to load inventory
            </p>

            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Total Products"
          value={summary.totalProducts}
          icon={Package}
        />

        <SummaryCard
          title="In Stock"
          value={summary.inStock}
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Low Stock"
          value={summary.lowStock}
          icon={AlertTriangle}
        />

        <SummaryCard
          title="Out of Stock"
          value={summary.outOfStock}
          icon={XCircle}
        />

        <SummaryCard
          title="Inventory Value"
          value={`₹${summary.inventoryValue.toLocaleString("en-IN")}`}
          icon={Boxes}
        />
      </div>

      {/* FILTERS */}
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />

            <h2 className="text-sm font-semibold">
              Inventory Filters
            </h2>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {/* SEARCH */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder="Search product or SKU..."
              className="pl-9"
            />
          </div>

          {/* CATEGORY */}
          <select
            value={filters.categoryId}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                categoryId: event.target.value,
              }))
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="ALL">All Categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* STOCK */}
          <select
            value={filters.stockStatus}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                stockStatus:
                  event.target.value as InventoryStockFilter,
              }))
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="ALL">All Stock</option>

            <option value="IN_STOCK">In Stock</option>

            <option value="LOW_STOCK">Low Stock</option>

            <option value="OUT_OF_STOCK">
              Out of Stock
            </option>
          </select>

          {/* ONLINE */}
          <select
            value={filters.onlineStatus}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                onlineStatus:
                  event.target.value as InventoryOnlineFilter,
              }))
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="ALL">All Products</option>

            <option value="ONLINE">
              Online Enabled
            </option>

            <option value="OFFLINE">Offline</option>
          </select>
        </div>

        <div className="mt-3">
          <select
            value={filters.sort}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                sort: event.target.value as InventorySort,
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm md:w-auto"
          >
            <option value="NAME_ASC">
              Sort: Name A-Z
            </option>

            <option value="STOCK_LOW_HIGH">
              Sort: Stock Low → High
            </option>

            <option value="STOCK_HIGH_LOW">
              Sort: Stock High → Low
            </option>

            <option value="VALUE_HIGH_LOW">
              Sort: Inventory Value High → Low
            </option>

            <option value="PRICE_LOW_HIGH">
              Sort: Price Low → High
            </option>

            <option value="PRICE_HIGH_LOW">
              Sort: Price High → Low
            </option>
          </select>
        </div>
      </div>

      {/* ALERTS */}
      {(summary.lowStock > 0 ||
        summary.outOfStock > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {summary.outOfStock > 0 && (
            <button
              type="button"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  stockStatus: "OUT_OF_STOCK",
                }))
              }
              className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-left transition hover:bg-destructive/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>

              <div>
                <p className="font-medium">
                  {summary.outOfStock} products are out of stock
                </p>

                <p className="text-sm text-muted-foreground">
                  Click to view out-of-stock products.
                </p>
              </div>
            </button>
          )}

          {summary.lowStock > 0 && (
            <button
              type="button"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  stockStatus: "LOW_STOCK",
                }))
              }
              className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left transition hover:bg-amber-500/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <p className="font-medium">
                  {summary.lowStock} products have low stock
                </p>

                <p className="text-sm text-muted-foreground">
                  Stock quantity is 5 or less.
                </p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <div>
            <h2 className="font-semibold">
              Inventory
            </h2>

            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} of{" "}
              {products.length} products
            </p>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">
                  Product
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Category
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Cost Price
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Selling Price
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Stock
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Inventory Value
                </th>

                <th className="px-4 py-3 text-center font-medium">
                  Online
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <LoadingRows />
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center"
                  >
                    <Package className="mx-auto h-8 w-8 text-muted-foreground" />

                    <p className="mt-3 font-medium">
                      No products found
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Try changing your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <InventoryRow
                    key={product.id}
                    product={product}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE */}
        <div className="divide-y md:hidden">
          {loading ? (
            <div className="space-y-3 p-4">
              <div className="h-24 animate-pulse rounded-lg bg-muted" />
              <div className="h-24 animate-pulse rounded-lg bg-muted" />
              <div className="h-24 animate-pulse rounded-lg bg-muted" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Package className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 font-medium">
                No products found
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <MobileInventoryCard
                key={product.id}
                product={product}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {title}
        </p>

        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <p className="mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function InventoryRow({
  product,
}: {
  product: InventoryProduct;
}) {
  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-4">
        <div>
          <p className="font-medium">
            {product.name}
          </p>

          {product.sku && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}
        </div>
      </td>

      <td className="px-4 py-4 text-muted-foreground">
        {product.categoryName ?? "Uncategorized"}
      </td>

      <td className="px-4 py-4 text-right">
        ₹{product.costPrice.toLocaleString("en-IN")}
      </td>

      <td className="px-4 py-4 text-right">
        ₹{product.sellingPrice.toLocaleString("en-IN")}
      </td>

      <td className="px-4 py-4 text-right font-semibold">
        {product.stockQuantity}
      </td>

      <td className="px-4 py-4 text-right">
        ₹{product.inventoryValue.toLocaleString("en-IN")}
      </td>

      <td className="px-4 py-4 text-center">
        {product.onlineEnabled ? (
          <Wifi className="mx-auto h-4 w-4 text-emerald-600" />
        ) : (
          <WifiOff className="mx-auto h-4 w-4 text-muted-foreground" />
        )}
      </td>

      <td className="px-4 py-4">
        <StockBadge status={product.status} />
      </td>
    </tr>
  );
}

function MobileInventoryCard({
  product,
}: {
  product: InventoryProduct;
}) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {product.name}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {product.sku
              ? `SKU: ${product.sku}`
              : "No SKU"}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {product.categoryName ?? "Uncategorized"}
          </p>
        </div>

        <StockBadge status={product.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Stock
          </p>

          <p className="mt-1 font-semibold">
            {product.stockQuantity}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Price
          </p>

          <p className="mt-1 font-semibold">
            ₹{product.sellingPrice.toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Value
          </p>

          <p className="mt-1 font-semibold">
            ₹{product.inventoryValue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        {product.onlineEnabled ? (
          <>
            <Wifi className="h-3.5 w-3.5 text-emerald-600" />
            Online enabled
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5" />
            Online disabled
          </>
        )}
      </div>
    </div>
  );
}

function StockBadge({
  status,
}: {
  status: InventoryProduct["status"];
}) {
  if (status === "OUT_OF_STOCK") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
        <XCircle className="h-3 w-3" />
        Out of stock
      </span>
    );
  }

  if (status === "LOW_STOCK") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700">
        <AlertTriangle className="h-3 w-3" />
        Low stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-3 w-3" />
      In stock
    </span>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="border-b">
          {Array.from({ length: 8 }).map(
            (_, cellIndex) => (
              <td
                key={cellIndex}
                className="px-4 py-4"
              >
                <div className="h-4 animate-pulse rounded bg-muted" />
              </td>
            )
          )}
        </tr>
      ))}
    </>
  );
}