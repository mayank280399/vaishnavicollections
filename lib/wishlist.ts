import { createClient } from "@/lib/supabase/client";

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};


/**
 * Get the current user's wishlist.
 */
export async function getWishlistItems(): Promise<
  WishlistItem[]
> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error loading wishlist:",
      error,
    );

    throw error;
  }

  return (data ?? []) as WishlistItem[];
}


/**
 * Check whether a product is already
 * in the current user's wishlist.
 */
export async function isInWishlist(
  productId: string,
): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) {
    console.error(
      "Error checking wishlist:",
      error,
    );

    throw error;
  }

  return Boolean(data);
}


/**
 * Add a product to the wishlist.
 *
 * Uses upsert so the same product cannot
 * be inserted twice for the same user.
 */
export async function addToWishlist(
  productId: string,
): Promise<WishlistItem> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Please sign in to add products to your wishlist.",
    );
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .upsert(
      {
        user_id: user.id,
        product_id: productId,
      },
      {
        onConflict: "user_id,product_id",
      },
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error adding product to wishlist:",
      error,
    );

    throw error;
  }

  return data as WishlistItem;
}


/**
 * Remove a product from the wishlist.
 */
export async function removeFromWishlist(
  productId: string,
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) {
    console.error(
      "Error removing product from wishlist:",
      error,
    );

    throw error;
  }
}


/**
 * Toggle a product in the wishlist.
 *
 * Returns true when the product was added,
 * false when it was removed.
 */
export async function toggleWishlist(
  productId: string,
): Promise<boolean> {
  const exists =
    await isInWishlist(productId);

  if (exists) {
    await removeFromWishlist(productId);
    return false;
  }

  await addToWishlist(productId);
  return true;
}