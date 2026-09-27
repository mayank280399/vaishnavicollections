import { createClient } from "@/lib/supabase/client";

import type {
  InventoryCategory,
  InventoryProduct,
  InventoryStockStatus,
} from "./types";

const LOW_STOCK_THRESHOLD = 5;

function getStockStatus(
  stockQuantity: number
): InventoryStockStatus {
  if (stockQuantity <= 0) {
    return "OUT_OF_STOCK";
  }

  if (stockQuantity <= LOW_STOCK_THRESHOLD) {
    return "LOW_STOCK";
  }

  return "IN_STOCK";
}

export async function getInventoryProducts(): Promise<{
  products: InventoryProduct[];
  error: string | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      category_id,
      sku,
      name,
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
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading inventory products:",
      error
    );

    return {
      products: [],
      error: error.message,
    };
  }

  const categoryIds = Array.from(
    new Set(
      (data ?? [])
        .map((product) => product.category_id)
        .filter(Boolean)
    )
  ) as string[];

  let categories: InventoryCategory[] = [];

  if (categoryIds.length > 0) {
    const {
      data: categoryData,
      error: categoryError,
    } = await supabase
      .from("product_categories")
      .select(`
        id,
        name
      `)
      .in("id", categoryIds);

    if (categoryError) {
      console.error(
        "Error loading inventory categories:",
        categoryError
      );
    } else {
      categories = (categoryData ??
        []) as InventoryCategory[];
    }
  }

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category.name,
    ])
  );

  const products: InventoryProduct[] = (data ?? []).map(
    (product) => {
      const stockQuantity = Number(
        product.stock_quantity ?? 0
      );

      const costPrice = Number(
        product.cost_price ?? 0
      );

      return {
        id: product.id,
        category_id: product.category_id,
        sku: product.sku,
        name: product.name,
        selling_price: Number(
          product.selling_price ?? 0
        ),
        cost_price: costPrice,
        stock_quantity: stockQuantity,
        online_enabled: Boolean(
          product.online_enabled
        ),
        online_price:
          product.online_price === null
            ? null
            : Number(product.online_price),
        visibility: product.visibility,
        featured: Boolean(product.featured),
        created_at: product.created_at,
        updated_at: product.updated_at,
        category_name: product.category_id
          ? categoryMap.get(product.category_id) ?? null
          : null,
        stock_status:
          getStockStatus(stockQuantity),
        inventory_value:
          stockQuantity * costPrice,
      };
    }
  );

  return {
    products,
    error: null,
  };
}