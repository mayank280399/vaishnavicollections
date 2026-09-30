"use client";

import {
  Check,
  Heart,
  Loader2,
  Share2,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";

import { useShopping } from "@/context/ShoppingContext";

interface ProductActionsProps {
  productId: string;
  productName: string;
  stockQuantity: number | null;
  disabled?: boolean;
}

export default function ProductActions({
  productId,
  productName,
  stockQuantity,
  disabled = false,
}: ProductActionsProps) {
  const {
    cartItems,
    addToCart,
    toggleWishlist,
    isFavorite,
  } = useShopping();

  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const cartItem = cartItems.find(
    (item) => item.product_id === productId,
  );

  const isInCart = Boolean(cartItem);
  const wishlisted = isFavorite(productId);

  const hasStock =
    !disabled &&
    (stockQuantity === null || stockQuantity > 0);

  const handleAddToCart = async () => {
    if (!hasStock || isInCart || loading) {
      return;
    }

    setLoading(true);

    try {
      // Product page always adds ONE item.
      // Quantity is changed from the Cart page.
      await addToCart(productId, 1);
    } catch (error) {
      console.error(
        "Failed to add product to cart:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to add this product to your cart.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (loading || sharing) return;

    setLoading(true);

    try {
      await toggleWishlist(productId);
    } catch (error) {
      console.error(
        "Failed to update wishlist:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to update your wishlist.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (sharing) return;

    const shareUrl =
      typeof window !== "undefined"
        ? window.location.href
        : "";

    if (!shareUrl) return;

    setSharing(true);

    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
      ) {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} at Vaishnavi Collections.`,
          url: shareUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      // User cancelled the native share dialog.
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "Failed to share product:",
        error,
      );
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      {/* Add to Cart */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={
          !hasStock ||
          isInCart ||
          loading
        }
        className="
          flex
          min-h-11
          flex-1
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-[#0f2747]
          px-5
          text-sm
          font-medium
          text-white
          transition
          hover:bg-[#17365f]
          disabled:cursor-not-allowed
          disabled:bg-slate-100
          disabled:text-slate-400
        "
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : !hasStock ? (
          "Out of Stock"
        ) : isInCart ? (
          <>
            <Check className="h-4 w-4" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </>
        )}
      </button>

      {/* Wishlist */}
      <button
        type="button"
        onClick={handleWishlist}
        disabled={loading || sharing}
        aria-label={
          wishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          transition
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${
            wishlisted
              ? "border-[#c9a227] bg-[#c9a227]/10 text-[#b18b17]"
              : "border-slate-200 text-slate-700 hover:border-[#c9a227] hover:text-[#b18b17]"
          }
        `}
      >
        <Heart
          className={`h-5 w-5 ${
            wishlisted ? "fill-current" : ""
          }`}
        />
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={handleShare}
        disabled={sharing}
        aria-label="Share product"
        className="
          flex
          h-11
          min-w-11
          shrink-0
          items-center
          justify-center
          gap-2
          rounded-lg
          border
          border-slate-200
          px-3
          text-slate-700
          transition
          hover:border-[#c9a227]
          hover:text-[#b18b17]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {sharing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : copied ? (
          <>
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">
              Link Copied
            </span>
          </>
        ) : (
          <>
            <Share2 className="h-5 w-5" />
            <span className="hidden sm:inline">
              Share
            </span>
          </>
        )}
      </button>
    </div>
  );
}