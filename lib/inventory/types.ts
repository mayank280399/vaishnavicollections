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

export type InventoryVariant = {
  id: string;
  name: string;
  sku: string | null;
  stockQuantity: number;
  sellingPrice: number;
};

export type InventoryProduct = {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  sku: string | null;
  name: string;
  imageUrl: string | null;
  sellingPrice: number;
  costPrice: number;
  stockQuantity: number;
  onlineEnabled: boolean;
  onlinePrice: number | null;
  visibility: string;
  featured: boolean;
  status: InventoryStockStatus;
  variants: InventoryVariant[];
  inventoryValue: number;
  createdAt: string;
  updatedAt: string;
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

export type InventoryAlert = {
  type: "OUT_OF_STOCK" | "LOW_STOCK";
  count: number;
};

export type InventorySummary = {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  inventoryValue: number;
};