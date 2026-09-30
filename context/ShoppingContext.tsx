"use client";

import {
  createContext,
  useContext,
} from "react";

import type { CartItem } from "@/lib/cart";
import type { WishlistItem } from "@/lib/wishlist";

export type ShoppingContextType = {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];

  cartCount: number;
  wishlistCount: number;

  loading: boolean;

  addToCart: (
    productId: string,
    quantity?: number,
  ) => Promise<void>;

  updateQuantity: (
    cartItemId: string,
    quantity: number,
  ) => Promise<void>;

  removeCartItem: (
    cartItemId: string,
  ) => Promise<void>;

  clearCartItems: () => Promise<void>;

  toggleWishlist: (
    productId: string,
  ) => Promise<boolean>;

  isFavorite: (
    productId: string,
  ) => boolean;

  refreshShoppingData: () => Promise<void>;
};

export const ShoppingContext =
  createContext<ShoppingContextType | undefined>(
    undefined,
  );

export function useShopping() {
  const context = useContext(ShoppingContext);

  if (!context) {
    throw new Error(
      "useShopping must be used inside ShoppingProvider",
    );
  }

  return context;
}