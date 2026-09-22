"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Tag, Truck as TruckIcon, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { offers } from '@/lib/data';
import styles from './OffersBento.module.css';

const IconMap: Record<number, React.ReactNode> = {
  1: <TruckIcon size={24} />,
  2: <Tag size={24} />,
  3: <Users size={24} />,
  4: <Tag size={24} />,
  5: <Calendar size={24} />,
};

export default function OffersBento() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className={`section ${styles.section}`} ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="badge">Special Deals</span>
          <h2 className="heading-lg">Offers For You</h2>
          <p>Don&apos;t miss out on our limited time offers and exclusive member benefits.</p>
        </motion.div>

        <div className={styles.grid}>
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              className={`${styles.offerCard} ${styles[offer.size]}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{ '--accent-color': offer.accent } as React.CSSProperties}
            >
              {/* Background Image */}
              <div className={styles.imageWrap}>
                <img src={offer.image} alt="" className={styles.image} />
                <div className={styles.imageOverlay} />
              </div>

              <div className={styles.content}>
                <div className={styles.header}>
                  <span className={styles.badge}>{offer.badge}</span>
                  <div className={styles.iconWrap}>
                    {IconMap[offer.id]}
                  </div>
                </div>

                <div className={styles.body}>
                  <h3 className={styles.title}>{offer.title}</h3>
                  <p className={styles.description}>{offer.description}</p>
                </div>

                <div className={styles.footer}>
                  <Link href="/products" className={styles.cta}>
                    {offer.cta}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
