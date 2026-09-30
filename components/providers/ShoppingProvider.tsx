"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import {
  getCartItems,
  addToCart as addCartItem,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  type CartItem,
} from "@/lib/cart";

import {
  getWishlistItems,
  addToWishlist,
  removeFromWishlist,
  type WishlistItem,
} from "@/lib/wishlist";

import {
  ShoppingContext,
  type ShoppingContextType,
} from "@/context/ShoppingContext";

interface ShoppingProviderProps {
  children: React.ReactNode;
}

export default function ShoppingProvider({
  children,
}: ShoppingProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(
    [],
  );

  const [wishlistItems, setWishlistItems] =
    useState<WishlistItem[]>([]);

  const [loading, setLoading] = useState(true);

  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const refreshShoppingData = useCallback(
    async () => {
      setLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setCartItems([]);
          setWishlistItems([]);
          return;
        }

        const [cart, wishlist] =
          await Promise.all([
            getCartItems(),
            getWishlistItems(),
          ]);

        setCartItems(cart);
        setWishlistItems(wishlist);
      } catch (error) {
        console.error(
          "Failed to load shopping data:",
          error,
        );
      } finally {
        setLoading(false);
      }
    },
    [supabase],
  );

  useEffect(() => {
    refreshShoppingData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Let the auth event finish before making
      // another Supabase request.
      setTimeout(() => {
        refreshShoppingData();
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, refreshShoppingData]);

  const handleAddToCart = useCallback(
    async (
      productId: string,
      quantity = 1,
    ) => {
      await addCartItem(productId, quantity);
      await refreshShoppingData();
    },
    [refreshShoppingData],
  );

  const handleUpdateQuantity = useCallback(
    async (
      cartItemId: string,
      quantity: number,
    ) => {
      await updateCartQuantity(
        cartItemId,
        quantity,
      );

      await refreshShoppingData();
    },
    [refreshShoppingData],
  );

  const handleRemoveCartItem = useCallback(
    async (cartItemId: string) => {
      await removeFromCart(cartItemId);
      await refreshShoppingData();
    },
    [refreshShoppingData],
  );

  const handleClearCart = useCallback(
    async () => {
      await clearCart();
      await refreshShoppingData();
    },
    [refreshShoppingData],
  );

  const handleToggleWishlist = useCallback(
    async (productId: string) => {
      const existing = wishlistItems.some(
        (item) =>
          item.product_id === productId,
      );

      if (existing) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }

      await refreshShoppingData();

      return !existing;
    },
    [wishlistItems, refreshShoppingData],
  );

  const isFavorite = useCallback(
    (productId: string) => {
      return wishlistItems.some(
        (item) =>
          item.product_id === productId,
      );
    },
    [wishlistItems],
  );

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );
  }, [cartItems]);

  const wishlistCount = wishlistItems.length;

  const contextValue =
    useMemo<ShoppingContextType>(
      () => ({
        cartItems,
        wishlistItems,

        cartCount,
        wishlistCount,

        loading,

        addToCart: handleAddToCart,

        updateQuantity:
          handleUpdateQuantity,

        removeCartItem:
          handleRemoveCartItem,

        clearCartItems:
          handleClearCart,

        toggleWishlist:
          handleToggleWishlist,

        isFavorite,

        refreshShoppingData,
      }),
      [
        cartItems,
        wishlistItems,
        cartCount,
        wishlistCount,
        loading,
        handleAddToCart,
        handleUpdateQuantity,
        handleRemoveCartItem,
        handleClearCart,
        handleToggleWishlist,
        isFavorite,
        refreshShoppingData,
      ],
    );

  return (
    <ShoppingContext.Provider
      value={contextValue}
    >
      {children}
    </ShoppingContext.Provider>
  );
}