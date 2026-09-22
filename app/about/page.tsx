"use client";
import React from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import CallToAction from '@/components/CallToAction/CallToAction';
import { motion } from 'framer-motion';
import { team, stats } from '@/lib/data';
import styles from './AboutPage.module.css';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <motion.div
              className={styles.heroContent}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="badge">Our Story</span>
              <h1 className="heading-xl">Curating Spaces <br /> <span>with Purpose.</span></h1>
              <p>Founded in 2020, Vaishnavi Collections began as a small studio with a simple mission: to bridge the gap between high-end design and everyday accessibility.</p>
            </motion.div>
          </div>
        </section>

        {/* Vision Section */}
        <section className={`section ${styles.vision}`}>
          <div className="container">
            <div className={styles.visionGrid}>
              <div className={styles.visionInfo}>
                <h2 className="heading-lg">Quality is our <br /> fundamental belief.</h2>
                <p>We work directly with master artisans and sustainable manufacturers to bring you pieces that aren&apos;t just beautiful, but built to last for generations to come.</p>
                <div className={styles.stats}>
                  {stats.map((stat, i) => (
                    <div key={i} className={styles.statItem}>
                      <h3>{stat.value}{stat.suffix}</h3>
                      <p>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.visionImage}>
                <div className={styles.imagePlaceholder}>
                  {/* Placeholder for an artistic image */}
                  <Image src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop" alt="Quality Craftsmanship" fill className={styles.image} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className={`section ${styles.team}`}>
          <div className="container">
            <div className="section-header">
              <span className="badge">The Minds Behind</span>
              <h2 className="heading-lg">Meet Our Team</h2>
              <p>A diverse group of designers, engineers, and creatives working together from our New York headquarters.</p>
            </div>

            <div className={styles.teamGrid}>
              {team.map((member, i) => (
                <motion.div
                  key={i}
                  className={styles.teamCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={styles.memberAvatar}>
                    <Image 
                      src={member.image} 
                      alt={member.name} 
                      fill 
                      className={styles.avatarImg}
                    />
                  </div>
                  <h3 className={styles.memberName}>{member.name}</h3>
                  <p className={styles.memberRole}>{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
