export type CategoryType = "PRODUCT" | "SERVICE";

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  category_type: CategoryType | string;
  parent_id: string | null;
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
}