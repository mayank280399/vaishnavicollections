import { createClient } from "@/lib/supabase/client";

import type {
  InventoryCategory,
  InventoryProduct,
  InventoryStockStatus,
  InventoryVariant,
} from "./types";

const LOW_STOCK_THRESHOLD = 5;

/*
 * --------------------------------------------------
 * Supabase row types
 * --------------------------------------------------
 *
 * These describe the exact fields selected from
 * Supabase. They are kept separate from the
 * UI/domain types in ./types.
 */

/*
 * products
 */
type InventoryProductRow = {
  id: string;
  category_id: string | null;
  sku: string | null;
  name: string;
  selling_price: number | string | null;
  cost_price: number | string | null;
  stock_quantity: number | string | null;
  online_enabled: boolean | null;
  online_price: number | string | null;
  visibility: string;
  featured: boolean | null;
  created_at: string;
  updated_at: string;
};

/*
 * product_categories
 */
type InventoryCategoryRow = {
  id: string;
  name: string;
};

/*
 * product_images
 */
type InventoryProductImageRow = {
  id: string;
  product_id: string;
  image_url: string | null;
  is_primary: boolean | null;
  sort_order: number | null;
};

/*
 * product_variants
 */
type InventoryVariantRow = {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  stock_quantity: number | string | null;
  selling_price: number | string | null;
};

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

  /*
   * Load products and their primary image.
   *
   * We intentionally load product_images separately rather than
   * relying on a nested relation so this remains compatible with
   * the existing database structure.
   */
  const {
    data,
    error,
  } = await supabase
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

  /*
   * Supabase's inferred response type can be weak when the
   * generated Database type is not connected to the client.
   *
   * Establish the selected row shape explicitly here.
   */
  const rawProducts =
    (data ?? []) as InventoryProductRow[];

  if (rawProducts.length === 0) {
    return {
      products: [],
      error: null,
    };
  }

  /*
   * ---------------------------------------------------------
   * Categories
   * ---------------------------------------------------------
   */

  const categoryIds = Array.from(
    new Set(
      rawProducts
        .map(
          (
            product: InventoryProductRow
          ) => product.category_id
        )
        .filter(
          (
            categoryId: string | null
          ): categoryId is string =>
            Boolean(categoryId)
        )
    )
  );

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
      const rawCategories =
        (categoryData ??
          []) as InventoryCategoryRow[];

      categories = rawCategories.map(
        (
          category: InventoryCategoryRow
        ): InventoryCategory => ({
          id: category.id,
          name: category.name,
        })
      );
    }
  }

  const categoryMap = new Map<
    string,
    string
  >(
    categories.map(
      (
        category: InventoryCategory
      ): [string, string] => [
        category.id,
        category.name,
      ]
    )
  );

  /*
   * ---------------------------------------------------------
   * Product images
   * ---------------------------------------------------------
   */

  const productIds = rawProducts.map(
    (
      product: InventoryProductRow
    ) => product.id
  );

  const {
    data: imageData,
    error: imageError,
  } = await supabase
    .from("product_images")
    .select(`
      id,
      product_id,
      image_url,
      is_primary,
      sort_order
    `)
    .in("product_id", productIds)
    .order("is_primary", {
      ascending: false,
    })
    .order("sort_order", {
      ascending: true,
    });

  if (imageError) {
    console.error(
      "Error loading inventory product images:",
      imageError
    );
  }

  const rawImages =
    (imageData ??
      []) as InventoryProductImageRow[];

  /*
   * Map the first/primary image to each product.
   *
   * Because the query orders primary images first and then
   * by sort order, the first image encountered for a product
   * becomes its preferred image.
   */
  const imageMap = new Map<
    string,
    string | null
  >();

  for (
    const image of rawImages
  ) {
    if (
      !imageMap.has(
        image.product_id
      )
    ) {
      imageMap.set(
        image.product_id,
        image.image_url
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * Product variants
   * ---------------------------------------------------------
   */

  const {
    data: variantData,
    error: variantError,
  } = await supabase
    .from("product_variants")
    .select(`
      id,
      product_id,
      name,
      sku,
      stock_quantity,
      selling_price
    `)
    .in("product_id", productIds)
    .order("name", {
      ascending: true,
    });

  if (variantError) {
    console.error(
      "Error loading inventory variants:",
      variantError
    );
  }

  const rawVariants =
    (variantData ??
      []) as InventoryVariantRow[];

  /*
   * Group variants by product.
   */
  const variantsMap = new Map<
    string,
    InventoryVariant[]
  >();

  for (
    const variant of rawVariants
  ) {
    const productVariants =
      variantsMap.get(
        variant.product_id
      ) ?? [];

    productVariants.push({
      id: variant.id,

      name: variant.name,

      sku: variant.sku,

      stockQuantity: Number(
        variant.stock_quantity ?? 0
      ),

      sellingPrice: Number(
        variant.selling_price ?? 0
      ),
    });

    variantsMap.set(
      variant.product_id,
      productVariants
    );
  }

  /*
   * ---------------------------------------------------------
   * Build UI-friendly InventoryProduct objects
   * ---------------------------------------------------------
   */

  const products: InventoryProduct[] =
    rawProducts.map(
      (
        product: InventoryProductRow
      ): InventoryProduct => {
        const stockQuantity =
          Number(
            product.stock_quantity ?? 0
          );

        const costPrice =
          Number(
            product.cost_price ?? 0
          );

        return {
          id: product.id,

          categoryId:
            product.category_id,

          categoryName:
            product.category_id
              ? categoryMap.get(
                  product.category_id
                ) ?? null
              : null,

          sku: product.sku,

          name: product.name,

          imageUrl:
            imageMap.get(
              product.id
            ) ?? null,

          sellingPrice:
            Number(
              product.selling_price ?? 0
            ),

          costPrice,

          stockQuantity,

          onlineEnabled:
            Boolean(
              product.online_enabled
            ),

          onlinePrice:
            product.online_price === null
              ? null
              : Number(
                  product.online_price
                ),

          visibility:
            product.visibility,

          featured:
            Boolean(
              product.featured
            ),

          status:
            getStockStatus(
              stockQuantity
            ),

          variants:
            variantsMap.get(
              product.id
            ) ?? [],

          inventoryValue:
            stockQuantity *
            costPrice,

          createdAt:
            product.created_at,

          updatedAt:
            product.updated_at,
        };
      }
    );

  return {
    products,
    error: null,
  };
}