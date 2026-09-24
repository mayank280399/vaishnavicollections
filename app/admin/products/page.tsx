"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Package } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { ProductDialog } from "@/components/admin/products/product-dialog";
import {
  ProductsTable,
  type Product,
} from "@/components/admin/products/products-table";

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  active: boolean;
};

export default function ProductsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: productsError } = await supabase
      .from("products")
      .select(`
        id,
        category_id,
        sku,
        name,
        short_description,
        selling_price,
        cost_price,
        stock_quantity,
        online_enabled,
        online_price,
        visibility,
        featured,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error("Error loading products:", productsError);
      setError(productsError.message);
      setProducts([]);
    } else {
      setProducts((data ?? []) as Product[]);
    }

    setLoading(false);
  }, [supabase]);

  const loadCategories = useCallback(async () => {
    const { data, error: categoriesError } = await supabase
      .from("product_categories")
      .select(`
        id,
        name,
        parent_id,
        active
      `)
      .eq("active", true)
      .order("name", { ascending: true });

    if (categoriesError) {
      console.error(
        "Error loading product categories:",
        categoriesError
      );

      setError(categoriesError.message);
      setCategories([]);
      return;
    }

    setCategories((data ?? []) as Category[]);
  }, [supabase]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    await Promise.all([
      loadProducts(),
      loadCategories(),
    ]);

    setLoading(false);
  }, [loadProducts, loadCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalProducts = products.length;

  const publishedProducts = products.filter(
    (product) => product.visibility === "PUBLISHED"
  ).length;

  const lowStockProducts = products.filter(
    (product) => {
      const stock = Number(product.stock_quantity ?? 0);

      return stock > 0 && stock <= 5;
    }
  ).length;

  const outOfStockProducts = products.filter(
    (product) =>
      Number(product.stock_quantity ?? 0) <= 0
  ).length;

  return (
   <div className="mx-auto w-full  space-y-5 px-4 py-5 sm:space-y-6 sm:px-5 sm:py-6 md:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
            <Package className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Products
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage your products, pricing and inventory.
            </p>
          </div>
        </div>

        <ProductDialog
          categories={categories}
          onSaved={loadProducts}
        />
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Products"
          value={totalProducts}
        />

        <SummaryCard
          title="Published"
          value={publishedProducts}
        />

        <SummaryCard
          title="Low Stock"
          value={lowStockProducts}
        />

        <SummaryCard
          title="Out of Stock"
          value={outOfStockProducts}
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* PRODUCTS TABLE */}
      <ProductsTable
        products={products}
        categories={categories}
        loading={loading}
        onEdit={setEditingProduct}
        onDeleted={loadProducts}
      />

      {/* EDIT PRODUCT */}
      <ProductDialog
        product={editingProduct}
        categories={categories}
        open={!!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
          }
        }}
        onSaved={() => {
          setEditingProduct(null);
          loadProducts();
        }}
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}