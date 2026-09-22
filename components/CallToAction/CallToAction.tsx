"use client";
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import styles from './CallToAction.module.css';

export default function CallToAction() {
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <section className={styles.section} ref={containerRef}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.background}>
            <motion.div style={{ y }} className={styles.parallaxBg} />
            <div className={styles.overlay} />
            <div className={styles.glow} />
          </div>

          <div className={styles.content}>
            <motion.div
              className={styles.badge}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Sparkles size={14} className={styles.sparkle} />
              <span>Limited Time Opportunity</span>
            </motion.div>

            <motion.h2
              className={styles.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Ready to elevate <br /> <span>living space?</span>
            </motion.h2>

            <motion.p
              className={styles.desc}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Join 50,000+ interior enthusiasts and start your journey with a 10% discount on your first order.
            </motion.p>

            <motion.div
              className={styles.ctas}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Link href="/products" className={styles.mainBtn}>
                Explore Collection
                <ArrowRight size={20} />
              </Link>
              <Link href="/contact" className={styles.secBtn}>
                Talk to a Stylist
              </Link>
            </motion.div>
          </div>

          {/* Floating Elements */}
          <div className={styles.floating}>
            <motion.div
              className={styles.float1}
              animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className={styles.float2}
              animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
