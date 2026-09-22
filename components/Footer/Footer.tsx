"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Aperture,
  Send,
  Users,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
  LifeBuoy,
  Terminal
} from 'lucide-react';
import styles from './Footer.module.css';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Top Section with Features */}
      <div className={styles.top}>
        <div className="container">
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Truck size={42} />
              </div>
              <div className={styles.featureText}>
                <h3>Global Shipping</h3>
                <p>Free on orders above $150</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <RotateCcw size={42} />
              </div>
              <div className={styles.featureText}>
                <h3>Easy Returns</h3>
                <p>30-day hassle-free policy</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <ShieldCheck size={42} />
              </div>
              <div className={styles.featureText}>
                <h3>Secure Payment</h3>
                <p>100% encrypted checkout</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <LifeBuoy size={42} />
              </div>
              <div className={styles.featureText}>
                <h3>24/7 Support</h3>
                <p>Available all day</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={styles.main}>
        <div className="container">
          <div className={styles.grid}>
            {/* Brand Info */}
            <div className={styles.brandCol}>
              <Link href="/" className={styles.logo}>
              <Image src="/vc_logo.png" alt="Vaishnavi Collections Logo" width={300} height={100} loading="eager"/>
                {/* <span className={styles.logoText}><span className={styles.logoLetter}>L</span>umivance</span> */}
              </Link>
              <p className={styles.brandDesc}>
                Curating timeless objects and modern essentials for inspired living. We believe in quality over quantity and craftsmanship that lasts generations.
              </p>
              <div className={styles.socials}>
                <Link href="#" className={styles.socialLink} aria-label="Instagram"><Aperture size={20} /></Link>
                <Link href="#" className={styles.socialLink} aria-label="Twitter"><Send size={20} /></Link>
                <Link href="#" className={styles.socialLink} aria-label="Facebook"><Users size={20} /></Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.linksCol}>
              <h3>Shop</h3>
              <nav>
                <Link href="/products">All Products</Link>
                <Link href="/products?category=Lighting">Lighting</Link>
                <Link href="/products?category=Furniture">Furniture</Link>
                <Link href="/products?category=Decor">Decor</Link>
                <Link href="/products?category=Textiles">Textiles</Link>
              </nav>
            </div>

            {/* Company */}
            <div className={styles.linksCol}>
              <h3>Company</h3>
              <nav>
                <Link href="/about">Our Story</Link>
                <Link href="/contact">Contact Us</Link>
                <Link href="#">Terms of Service</Link>
                <Link href="#">Privacy Policy</Link>
                <Link href="#">Shipping Info</Link>
              </nav>
            </div>

            {/* Newsletter */}
            <div className={styles.newsletterCol}>
              <h3>Join the Club</h3>
              <p>Subscribe to receive early access to new drops and design inspiration.</p>
              <form className={styles.form}>
                <div className={styles.inputWrap}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input type="email" placeholder="Your email address" required />
                  <button type="submit" aria-label="Subscribe">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p>&copy; {new Date().getFullYear()} Vaishnavi Collections. All rights reserved.</p>
            {/* <div className={styles.location}>
              <Terminal size={14} />
              <span>Developed by {" "}<a href="https://syednoor.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>Syed Shaeduzzaman Noor</a></span>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
