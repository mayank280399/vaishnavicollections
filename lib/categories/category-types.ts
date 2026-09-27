export type CategoryType = "PRODUCT" | "SERVICE";

export interface ProductCategory {
  id: string;

  name: string;

  slug: string;

  description: string | null;

  active: boolean;

  category_type: CategoryType | string;

  parent_id: string | null;

  // Top Collections
  is_top_collection: boolean;

  // Category image stored in Supabase Storage
  image_url: string | null;

  // Display order for Top Collections
  sort_order: number;

  created_at: string;

  updated_at: string;

  // Number of products directly assigned to this category
  product_count?: number;
}

export interface CategoryFormData {
  name: string;

  slug: string;

  description: string;

  category_type: CategoryType;

  parent_id: string | null;

  active: boolean;

  // Top Collections
  is_top_collection: boolean;

  // Category image
  image_url: string | null;

  // Display order
  sort_order: number;
}