"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { slides } from "@/lib/data";
import styles from "./HeroBanner.module.css";

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAuto = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    if (isPlaying) startAuto();
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent((c) => (c + dir + slides.length) % slides.length);
    if (isPlaying) startAuto();
  };

  const slide = slides[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section className={styles.hero} aria-label="Featured banner">
      <div className={styles.track}>
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
            className={styles.slide}
            style={{ background: slide.bg }}
          >
            {/* Full Banner Background Image */}
            <div className={styles.imageContainer}>
              <motion.img
                src={slide.image}
                alt=""
                className={styles.backgroundImage}
                initial={{ scale: 1.15, filter: "blur(4px)" }}
                animate={{ scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className={styles.imageOverlay} />
            </div>

            <div className={`container ${styles.content}`}>
              <div className={styles.copy}>
                <motion.span
                  className="badge"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  style={{ background: "rgba(255,255,255,0.1)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
                >
                  {slide.badge}
                </motion.span>

                <motion.p
                  className={styles.subtitle}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {slide.subtitle}
                </motion.p>

                <motion.h1
                  className={`heading-xl ${styles.title}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38, duration: 0.6 }}
                >
                  {slide.title.split("\n").map((line, i) => (
                    <span key={i}>
                      {i === 1 ? <span className="text-accent">{line}</span> : line}
                      {i === 0 && <br />}
                    </span>
                  ))}
                </motion.h1>

                <motion.p
                  className={styles.desc}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.46, duration: 0.5 }}
                >
                  {slide.description}
                </motion.p>

                <motion.div
                  className={styles.ctas}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.54, duration: 0.5 }}
                >
                  <Link href={slide.ctaLink} className={`btn btn-accent btn-lg ${styles.primaryCta}`}>
                    {slide.cta}
                    <ArrowRight size={18} />
                  </Link>
                  <Link href="/products" className={`btn btn-ghost btn-lg`}>
                    View All
                  </Link>
                </motion.div>
              </div>
            </div>
            <div className={styles.backgroundImageOverlay}></div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={`container ${styles.controlsInner}`}>
          {/* Dots */}
          <div className={styles.dots}>
            {slides.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrows + play */}
          <div className={styles.arrows}>
            <button onClick={() => go(-1)} className={styles.arrowBtn} aria-label="Previous">
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className={styles.arrowBtn}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={() => go(1)} className={styles.arrowBtn} aria-label="Next">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
