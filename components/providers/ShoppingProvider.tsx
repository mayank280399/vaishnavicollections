"use client";

import React, {useCallback, useEffect, useMemo, useState,} from "react";

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

import type {
  AuthChangeEvent,
  Session,
} from "@supabase/supabase-js";

interface ShoppingProviderProps {
  children: React.ReactNode;
}

export default function ShoppingProvider({
  children,
}: ShoppingProviderProps) {
  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [wishlistItems, setWishlistItems] =
    useState<WishlistItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const refreshShoppingData =
    useCallback(
      async (
        userId?: string | null,
      ) => {
        setLoading(true);

        try {
          let currentUserId = userId;

          /*
           * Only query Auth when the caller did not
           * already provide the user ID.
           */
          if (
            currentUserId === undefined
          ) {
            const {
              data: { user },
            } =
              await supabase.auth.getUser();

            currentUserId =
              user?.id ?? null;
          }

          /*
           * No authenticated user means there is
           * no server-side cart/wishlist to load.
           */
          if (!currentUserId) {
            setCartItems([]);
            setWishlistItems([]);
            return;
          }

          const [
            cart,
            wishlist,
          ] = await Promise.all([
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
    let mounted = true;

    async function initializeShopping() {
      try {
        const {
          data: { user },
        } =
          await supabase.auth.getUser();

        if (!mounted) {
          return;
        }

        await refreshShoppingData(
          user?.id ?? null,
        );
      } catch (error) {
        console.error(
          "Failed to initialize shopping data:",
          error,
        );

        if (mounted) {
          setCartItems([]);
          setWishlistItems([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeShopping();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event: AuthChangeEvent,
          session: Session | null,
        ) => {
          /*
           * Do not call supabase.auth.getUser()
           * from inside the auth callback.
           *
           * The session already gives us the user.
           */
          if (!mounted) {
            return;
          }

          const userId =
            session?.user?.id ?? null;

          /*
           * Defer the database work until the Auth
           * callback has completed.
           */
          setTimeout(() => {
            if (mounted) {
              refreshShoppingData(
                userId,
              );
            }
          }, 0);
        },
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [
    supabase,
    refreshShoppingData,
  ]);

  const handleAddToCart =
    useCallback(
      async (
        productId: string,
        quantity = 1,
      ) => {
        await addCartItem(
          productId,
          quantity,
        );

        await refreshShoppingData();
      },
      [refreshShoppingData],
    );

  const handleUpdateQuantity =
    useCallback(
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

  const handleRemoveCartItem =
    useCallback(
      async (cartItemId: string) => {
        await removeFromCart(
          cartItemId,
        );

        await refreshShoppingData();
      },
      [refreshShoppingData],
    );

  const handleClearCart =
    useCallback(
      async () => {
        await clearCart();

        await refreshShoppingData();
      },
      [refreshShoppingData],
    );

  const handleToggleWishlist =
    useCallback(
      async (productId: string) => {
        const existing =
          wishlistItems.some(
            (item) =>
              item.product_id ===
              productId,
          );

        if (existing) {
          await removeFromWishlist(
            productId,
          );
        } else {
          await addToWishlist(
            productId,
          );
        }

        await refreshShoppingData();

        return !existing;
      },
      [
        wishlistItems,
        refreshShoppingData,
      ],
    );

  const isFavorite =
    useCallback(
      (productId: string) => {
        return wishlistItems.some(
          (item) =>
            item.product_id ===
            productId,
        );
      },
      [wishlistItems],
    );

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (
          total: number,
          item: CartItem,
        ) =>
          total + item.quantity,
        0,
      ),
    [cartItems],
  );

  const wishlistCount =
    wishlistItems.length;

  const contextValue =
    useMemo<ShoppingContextType>(
      () => ({
        cartItems,
        wishlistItems,

        cartCount,
        wishlistCount,

        loading,

        addToCart:
          handleAddToCart,

        updateQuantity:
          handleUpdateQuantity,

        removeCartItem:
          handleRemoveCartItem,

        clearCartItems:
          handleClearCart,

        toggleWishlist:
          handleToggleWishlist,

        isFavorite,

        refreshShoppingData:
          async () => {
            await refreshShoppingData();
          },
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