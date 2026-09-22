"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, Menu, X, ChevronDown, Sparkles } from "lucide-react";
import styles from "./Navbar.module.css";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Products",
    href: "/products",
    sub: [
      { label: "All Products", href: "/products" },
      { label: "Lighting", href: "/products?category=Lighting" },
      { label: "Furniture", href: "/products?category=Furniture" },
      { label: "Decor", href: "/products?category=Decor" },
      { label: "Textiles", href: "/products?category=Textiles" },
      { label: "Storage", href: "/products?category=Storage" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [cartCount] = useState(3);
  const [wishlistCount] = useState(5);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Top promo bar */}
      <div className={styles.promoBar}>
        <Sparkles size={14} />
        <span>Free shipping on orders over $150 · Use code <strong>Vaishnavi Collections</strong> for 10% off</span>
        <Sparkles size={14} />
      </div>

      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
          <Image src="/vc_logo.png" loading="eager" alt="Vaishnavi Collections Logo" width={300} height={55} />
            {/* <span className={styles.logoText}><span className={styles.logoLetter}>L</span>umivance</span> */}
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            {navLinks.map((link) => (
              <div
                key={link.label}
                className={styles.navItem}
                onMouseEnter={() => link.sub && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
                >
                  {link.label}
                  {link.sub && <ChevronDown size={14} className={styles.chevron} />}
                </Link>

                {link.sub && (
                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        ref={dropdownRef}
                        className={styles.dropdown}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                      >
                        {link.sub.map((sub) => (
                          <Link key={sub.label} href={sub.href} className={styles.dropdownItem}>
                            {sub.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.iconBtn} aria-label="Search">
              <Search size={19} />
            </button>
            <button className={styles.iconBtn} aria-label="Wishlist">
              <Heart size={19} />
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </button>
            <Link href="#" className={styles.cartBtn} aria-label="Cart">
              <ShoppingBag size={19} />
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </Link>
            <button
              className={styles.menuBtn}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className={styles.mobileMenu}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className={styles.mobileHeader}>
                <span className={styles.logoText}><span className={styles.logoLetter}>L</span>umivance</span>
                <button onClick={() => setMobileOpen(false)} className={styles.iconBtn}>
                  <X size={22} />
                </button>
              </div>
              <nav className={styles.mobileNav}>
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      className={styles.mobileNavLink}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {link.sub && (
                      <div className={styles.mobileSub}>
                        {link.sub.slice(1).map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            className={styles.mobileSubLink}
                            onClick={() => setMobileOpen(false)}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </nav>
              <div className={styles.mobileCtas}>
                <Link href="/products" className="btn btn-accent btn-lg" onClick={() => setMobileOpen(false)}>
                  Shop Now
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
