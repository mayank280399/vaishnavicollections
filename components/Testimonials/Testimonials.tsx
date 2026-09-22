"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, ChevronLeft, ChevronRight, MessageSquareText } from "lucide-react";
import { testimonials } from "@/lib/data";
import styles from "./Testimonials.module.css";

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent((c) => (c + dir + testimonials.length) % testimonials.length);
  };

  const t = testimonials[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0, scale: 0.96 }),
  };

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        {/* Stats row with glass effect */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "60px" }}>
          <motion.div
            className={styles.statsRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {[["50K+", "Happy Customers"], ["200+", "Curated Products"], ["4.9★", "Rating"]].map(([v, l]) => (
              <div key={l} className={styles.stat}>
                <strong>{v}</strong>
                <span>{l}</span>
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="badge">What Customers Say</span>
          <h2 className="heading-lg">Loved By Thousands</h2>
          <p>Real stories from real customers who&apos;ve transformed their spaces.</p>
        </motion.div>

        <motion.div
          className={styles.layout}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Side list */}
          <div className={styles.sideList}>
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                className={`${styles.sideItem} ${i === current ? styles.sideItemActive : ""}`}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              >
                <div className={styles.avatar}>
                  <img src={t.avatar} alt={t.name} className={styles.avatarImg} />
                </div>
                <div className={styles.sideInfo}>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Main testimonial */}
          <div className={styles.main}>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
                className={styles.testimonialCard}
              >
                <div className={styles.stars}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={18} fill="var(--accent)" stroke="none" />
                  ))}
                </div>

                <blockquote className={styles.text}>&quot;{t.text}&quot;</blockquote>

                <div className={styles.author}>
                  <div className={styles.authorAvatar}>
                    <img src={t.avatar} alt={t.name} className={styles.avatarImg} />
                  </div>
                  <div>
                    <p className={styles.authorName}>{t.name}</p>
                    <p className={styles.authorMeta}>{t.role} · {t.location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className={styles.controls}>
              <div className={styles.dots}>
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
                    onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  />
                ))}
              </div>
              <div className={styles.arrows}>
                <button onClick={() => go(-1)} className={styles.arrow}><ChevronLeft size={18} /></button>
                <button onClick={() => go(1)} className={styles.arrow}><ChevronRight size={18} /></button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
