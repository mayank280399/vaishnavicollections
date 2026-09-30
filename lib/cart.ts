
import { createClient } from "@/lib/supabase/client";

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

/**
 * Get the current user's cart items.
 */
export async function getCartItems(): Promise<CartItem[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Error loading cart:", error);
    throw error;
  }

  return (data ?? []) as CartItem[];
}

/**
 * Add a product to the cart.
 *
 * IMPORTANT:
 * A product can only exist once in a user's cart.
 *
 * If the product is already in the cart, its existing
 * quantity is returned unchanged.
 *
 * Quantity should only be changed through
 * updateCartQuantity().
 */
export async function addToCart(
  productId: string,
  quantity = 1,
): Promise<CartItem> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Please sign in to add products to your cart.",
    );
  }

  if (quantity <= 0) {
    throw new Error(
      "Cart quantity must be greater than zero.",
    );
  }

  // ---------------------------------------------------------
  // CHECK WHETHER PRODUCT IS ALREADY IN CART
  // ---------------------------------------------------------

  const { data: existingItem, error: existingError } =
    await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

  if (existingError) {
    console.error(
      "Error checking existing cart item:",
      existingError,
    );

    throw existingError;
  }

  // ---------------------------------------------------------
  // PRODUCT ALREADY EXISTS
  // ---------------------------------------------------------

  if (existingItem) {
    // Do NOT increase quantity.
    return existingItem as CartItem;
  }

  // ---------------------------------------------------------
  // PRODUCT DOES NOT EXIST — ADD IT ONCE
  // ---------------------------------------------------------

  const { data, error } = await supabase
    .from("cart_items")
    .insert({
      user_id: user.id,
      product_id: productId,
      quantity,
    })
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error adding product to cart:",
      error,
    );

    throw error;
  }

  return data as CartItem;
}

/**
 * Update the quantity of an existing cart item.
 *
 * Quantity <= 0 removes the item.
 */
export async function updateCartQuantity(
  cartItemId: string,
  quantity: number,
): Promise<CartItem | null> {
  if (quantity <= 0) {
    await removeFromCart(cartItemId);
    return null;
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Please sign in to manage your cart.",
    );
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartItemId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error updating cart item:",
      error,
    );

    throw error;
  }

  return data as CartItem;
}

/**
 * Remove one item from the cart.
 */
export async function removeFromCart(
  cartItemId: string,
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Please sign in to manage your cart.",
    );
  }

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "Error removing cart item:",
      error,
    );

    throw error;
  }
}

/**
 * Remove all items from the current user's cart.
 */
export async function clearCart(): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "Error clearing cart:",
      error,
    );

    throw error;
  }
}
