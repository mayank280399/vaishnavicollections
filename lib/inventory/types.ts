export type InventoryStockStatus =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK";

export type InventoryStockFilter =
  | "ALL"
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK";

export type InventoryOnlineFilter =
  | "ALL"
  | "ONLINE"
  | "OFFLINE";

export type InventorySort =
  | "NAME_ASC"
  | "STOCK_LOW_HIGH"
  | "STOCK_HIGH_LOW"
  | "VALUE_HIGH_LOW"
  | "PRICE_LOW_HIGH"
  | "PRICE_HIGH_LOW";

export type InventoryProduct = {
  id: string;
  category_id: string | null;
  sku: string | null;
  name: string;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
  online_enabled: boolean;
  online_price: number | null;
  visibility: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category_name: string | null;
  stock_status: InventoryStockStatus;
  inventory_value: number;
};

export type InventoryCategory = {
  id: string;
  name: string;
};

export type InventoryFilters = {
  search: string;
  categoryId: string;
  stockStatus: InventoryStockFilter;
  onlineStatus: InventoryOnlineFilter;
  sort: InventorySort;
};

export type InventorySummary = {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  inventoryValue: number;
};