"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./FeaturedProducts.module.css";

export default function FeaturedProducts() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });
  const featured = products.filter((p) => p.isBestSeller || p.isNew).slice(0, 8);

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.headerLeft}>
            <span className="badge">Handpicked for You</span>
            <h2 className="heading-lg">Featured Products</h2>
            <p className="text-muted">Our most-loved pieces, chosen by our editorial team.</p>
          </div>
          <Link href="/products" className={`btn btn-outline ${styles.viewAll}`}>
            View All Products
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className={styles.grid}>
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
