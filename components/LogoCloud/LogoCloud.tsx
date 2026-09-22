"use client";
import { useRef } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { brands } from "@/lib/data";
import styles from "./LogoCloud.module.css";

function MarqueeRow({ items, reverse }: { items: { name: string; logo: string }[]; reverse?: boolean }) {
  const x = useRef(0);

  return (
    <div className={styles.rowMask}>
      <motion.div
        className={styles.row}
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items].map((brand, i) => (
          <div key={`${brand.name}-${i}`} className={styles.item}>
            <img src={brand.logo} alt={brand.name} className={styles.logoImg} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function LogoCloud() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className={`section-sm ${styles.section}`} ref={ref}>
      <div className="container">
        <motion.div
          className={styles.intro}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.label}>As Featured In</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <MarqueeRow items={brands} />
        <div style={{ marginTop: 12 }}>
          <MarqueeRow items={[...brands].reverse()} reverse />
        </div>
      </motion.div>
    </section>
  );
}
