import { createClient } from "@/lib/supabase/server";

export async function getDailyEntryOptions() {
  const supabase = await createClient();

  const [
    categoriesResult,
    productsResult,
    variantsResult,
    customersResult,
  ] = await Promise.all([
    supabase
      .from("product_categories")
      .select("id, name, parent_id, category_type")
      .eq("active", true)
      .eq("category_type", "PRODUCT")
      .order("name"),

    supabase
      .from("products")
      .select(
        "id, name, category_id, selling_price, cost_price, visibility"
      )
      .neq("visibility", "ARCHIVED")
      .order("name"),

    supabase
      .from("product_variants")
      .select(
        "id, product_id, name, variant_value, selling_price, cost_price, stock_quantity"
      )
      .eq("active", true)
      .order("name"),

    supabase
      .from("customers")
      .select("id, customer_code, display_name, phone")
      .order("display_name"),
  ]);

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message);
  }

  if (productsResult.error) {
    throw new Error(productsResult.error.message);
  }

  if (variantsResult.error) {
    throw new Error(variantsResult.error.message);
  }

  if (customersResult.error) {
    throw new Error(customersResult.error.message);
  }

  return {
    categories: categoriesResult.data ?? [],
    products: productsResult.data ?? [],
    variants: variantsResult.data ?? [],
    customers: customersResult.data ?? [],
  };
}