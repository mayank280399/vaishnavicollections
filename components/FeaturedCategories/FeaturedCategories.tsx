"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { categories } from "@/lib/data";
import { ArrowRight } from "lucide-react";
import styles from "./FeaturedCategories.module.css";

export default function FeaturedCategories() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="badge">Browse By Category</span>
          <h2 className="heading-lg">Explore Our Collections</h2>
          <p>Thoughtfully curated objects for every corner of your home.</p>
        </motion.div>

        <div className={styles.grid}>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <Link
                href={`/products?category=${cat.name}`}
                className={styles.card}
              >
                <div className={styles.imageWrap}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className={styles.image}
                  />
                  <div className={styles.overlay} />
                </div>

                <div className={styles.info}>
                  <h3 className={styles.name}>{cat.name}</h3>
                  <p className={styles.desc}>{cat.description}</p>
                  <span className={styles.count}>{cat.count} products</span>
                </div>

                <div className={styles.arrow}>
                  <ArrowRight size={16} />
                </div>
              </Link>
            </motion.div>
          ))}

          {/* View all card */}
          {/* <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: categories.length * 0.08 }}
          >
            <Link href="/products" className={`${styles.card} ${styles.viewAll}`}>
              <span className={styles.viewAllText}>View All</span>
              <ArrowRight size={24} className={styles.viewAllArrow} />
            </Link>
          </motion.div> */}
        </div>
      </div>
    </section>
  );
}
