"use client";

import {
  Check,
  Copy,
  Heart,
  Loader2,
  MessageCircle,
  Share2,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";

import { useShopping } from "@/context/ShoppingContext";

interface ProductActionsProps {
  productId: string;
  productName: string;
  productPrice: number;
  productCategory?: string | null;
  productSlug: string;
  productImage?: string | null;
  stockQuantity: number | null;
  disabled?: boolean;
}

export default function ProductActions({
  productId,
  productName,
  productPrice,
  productCategory,
  productSlug,
  productImage,
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
  const viewedProductId = useRef<string | null>(null);

  useEffect(() => {
    if (
      viewedProductId.current === productId ||
      typeof window === "undefined" ||
      !window.dataLayer
    ) {
      return;
    }

    viewedProductId.current = productId;
    sendGAEvent("event", "view_item", {
      currency: "INR",
      value: productPrice,
      items: [{
        item_id: productId,
        item_name: productName,
        ...(productCategory ? { item_category: productCategory } : {}),
        price: productPrice,
        quantity: 1,
      }],
    });
  }, [productCategory, productId, productName, productPrice]);

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
      if (typeof window !== "undefined" && window.dataLayer) {
        sendGAEvent("event", "add_to_cart", {
          currency: "INR",
          value: productPrice,
          items: [{
            item_id: productId,
            item_name: productName,
            ...(productCategory ? { item_category: productCategory } : {}),
            price: productPrice,
            quantity: 1,
          }],
        });
      }
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

  const buildShareUrl = (source: string) => {
    if (typeof window === "undefined") return "";
    const url = new URL(
      `/products/${encodeURIComponent(productSlug)}`,
      window.location.origin,
    );
    url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", "social");
    url.searchParams.set("utm_campaign", "product_share");
    url.searchParams.set("utm_content", productSlug);
    return url.toString();
  };

  const handleShare = async () => {
    if (sharing) return;
    const shareUrl = buildShareUrl("native_share");
    if (!shareUrl) return;

    setSharing(true);
    try {
      let imageFile: File | undefined;
      if (productImage && typeof navigator !== "undefined" &&
          typeof navigator.canShare === "function" &&
          typeof File !== "undefined") {
        try {
          const imageResponse = await fetch(productImage, { mode: "cors" });
          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            const mimeType = blob.type || "image/jpeg";
            const extension = mimeType.includes("png") ? "png" :
              mimeType.includes("webp") ? "webp" : "jpg";
            imageFile = new File([blob], `${productSlug}.${extension}`, { type: mimeType });
          }
        } catch {
          // Some image hosts do not permit cross-origin downloads; URL sharing remains available.
        }
      }

      const shareData: ShareData = {
        title: productName,
        text: `Check out ${productName} at Vaishnavi Collections. ${shareUrl}`,
        url: shareUrl,
      };

      if (imageFile && navigator.canShare?.({ files: [imageFile] })) {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} at Vaishnavi Collections: ${shareUrl}`,
          files: [imageFile],
        });
      } else if (typeof navigator.share === "function") {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Failed to share product:", error);
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      } catch {
        alert("Unable to share this product on this browser. Please copy the page link from your address bar.");
      }
    } finally {
      setSharing(false);
    }
  };

  const handleWhatsAppShare = () => {
    const shareUrl = buildShareUrl("whatsapp");
    if (!shareUrl) return;
    const message = `Check out ${productName} at Vaishnavi Collections. ${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleFacebookShare = () => {
    const shareUrl = buildShareUrl("facebook");
    if (!shareUrl) return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleCopyLink = async () => {
    const shareUrl = buildShareUrl("copy_link");
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy product link:", error);
      alert("Unable to copy automatically. Please copy the page link from your address bar.");
    }
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-stretch">
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
          min-h-12
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-[#071A35]
          px-5
          text-sm
          font-medium
          text-white
          transition
          hover:bg-[#102b50]
          active:scale-[0.99]
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
          h-12
          w-full
          shrink-0
          sm:w-12
          items-center
          justify-center
          rounded-xl
          border
          transition
          active:scale-95
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

      {/* Share via device share sheet; includes the product photo where supported */}
      <button
        type="button"
        onClick={handleShare}
        disabled={sharing}
        aria-label="Share product"
        className="
          flex
          h-12
          min-w-0
          shrink-0
          sm:min-w-12
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-slate-200
          px-3
          active:scale-95
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

      {/* Explicit channels allow accurate campaign attribution */}
      <button
        type="button"
        onClick={handleWhatsAppShare}
        aria-label="Share product on WhatsApp"
        title="Share on WhatsApp"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-4 text-sm font-semibold text-[#128C4A] transition hover:bg-[#25D366]/15 active:scale-95 sm:px-3"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="sm:hidden">WhatsApp</span>
      </button>

      <button
        type="button"
        onClick={handleCopyLink}
        aria-label="Copy product link"
        title="Copy tracked product link"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-[#D4AF37] hover:text-[#071A35] active:scale-95 sm:px-3"
      >
        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        <span className="sm:hidden">{copied ? "Copied!" : "Copy link"}</span>
      </button>
    </div>
  );
}
