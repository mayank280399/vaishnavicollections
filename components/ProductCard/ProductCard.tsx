"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/data";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  index?: number;
  inView?: boolean;
}

export default function ProductCard({ product, index = 0, inView = true }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setWishlisted((w) => !w);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
    >
      <Link href={`/products/${product.id}`} className={styles.card}>
        {/* Image */}
        <div className={styles.imageWrap}>
          <div className={styles.imageBg} />
          <div className={styles.productVisual}>
            <img 
              src={product.image} 
              alt={product.name} 
              className={styles.productImage}
            />
          </div>

          {/* Badges */}
          <div className={styles.badges}>
            {product.badge && (
              <span
                className={`${styles.badge} ${
                  product.badge === "Sale"
                    ? styles.badgeSale
                    : product.badge === "New"
                    ? styles.badgeNew
                    : styles.badgeBest
                }`}
              >
                {product.badge === "Sale" && discount ? `-${discount}%` : product.badge}
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className={styles.quickActions}>
            <motion.button
              className={`${styles.actionBtn} ${wishlisted ? styles.wishlisted : ""}`}
              onClick={handleWishlist}
              aria-label="Wishlist"
              whileTap={{ scale: 0.85 }}
            >
              <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
            </motion.button>
            <motion.button
              className={styles.actionBtn}
              aria-label="Quick view"
              whileTap={{ scale: 0.85 }}
            >
              <Eye size={16} />
            </motion.button>
          </div>

          {/* Add to cart overlay */}
          <motion.button
            className={styles.cartOverlay}
            onClick={handleCart}
            whileTap={{ scale: 0.97 }}
          >
            <ShoppingBag size={15} />
            <span>{addedToCart ? "Added!" : "Add to Cart"}</span>
          </motion.button>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.meta}>
            <span className={styles.category}>{product.category}</span>
            <div className={styles.rating}>
              <Star size={11} fill="var(--accent)" stroke="none" />
              <span>{product.rating}</span>
              <span className={styles.reviews}>({product.reviewCount})</span>
            </div>
          </div>

          <h3 className={styles.name}>{product.name}</h3>

          <p className={styles.description}>{product.description}</p>

          {/* Colors */}
          <div className={styles.colors}>
            {product.colors.map((color) => (
              <span
                key={color}
                className={styles.colorDot}
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>

          {/* Price row */}
          <div className={styles.priceRow}>
            <div className={styles.prices}>
              <span className={styles.price}>${product.price}</span>
              {product.originalPrice && (
                <span className="price-original">${product.originalPrice}</span>
              )}
            </div>
            <button
              className={styles.buyBtn}
              onClick={handleCart}
              aria-label="Buy now"
            >
              <ShoppingBag size={14} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
