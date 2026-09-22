"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
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
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [cartCount] = useState(3);
  const [wishlistCount] = useState(5);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* =========================================================
          Top Promo Bar
          ========================================================= */}
      <div className="flex w-full items-center justify-center gap-2 bg-[#1B263B] px-4 py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
        <Sparkles
          size={14}
          className="hidden shrink-0 sm:block"
        />

        <span>
          Free shipping on orders over $150 · Use code{" "}
          <strong className="font-semibold">
            Vaishnavi Collections
          </strong>{" "}
          for 10% off
        </span>

        <Sparkles
          size={14}
          className="hidden shrink-0 sm:block"
        />
      </div>

      {/* =========================================================
          Navbar
          ========================================================= */}
      <header
        className={[
          "sticky top-0 z-50 w-full border-b transition-all duration-300",
          scrolled
            ? "border-gray-200 bg-white/95 shadow-sm backdrop-blur-md"
            : "border-transparent bg-white",
        ].join(" ")}
      >
        <div
          className={[
            "mx-auto flex w-full max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8",
            scrolled ? "h-16" : "h-20",
          ].join(" ")}
        >
          {/* =====================================================
              Logo
              ===================================================== */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
          >
            <Image
              src="/vc_logo.png"
              loading="eager"
              alt="Vaishnavi Collections Logo"
              width={300}
              height={55}
              className={[
                "h-auto w-auto object-contain transition-all duration-300",
                scrolled
                  ? "max-h-12 max-w-[220px]"
                  : "max-h-14 max-w-[250px]",
              ].join(" ")}
            />
          </Link>

          {/* =====================================================
              Desktop Navigation
              ===================================================== */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" &&
                  pathname.startsWith(link.href));

              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() =>
                    link.sub &&
                    setActiveDropdown(link.label)
                  }
                  onMouseLeave={() =>
                    setActiveDropdown(null)
                  }
                >
                  <Link
                    href={link.href}
                    className={[
                      "group flex items-center gap-1.5 py-2 text-sm font-medium transition-colors duration-200",
                      active
                        ? "text-[#C88A3D]"
                        : "text-[#1B263B] hover:text-[#C88A3D]",
                    ].join(" ")}
                  >
                    {link.label}

                    {link.sub && (
                      <ChevronDown
                        size={14}
                        className={[
                          "transition-transform duration-200",
                          activeDropdown === link.label
                            ? "rotate-180"
                            : "",
                        ].join(" ")}
                      />
                    )}
                  </Link>

                  {/* Active underline */}
                  <span
                    className={[
                      "absolute bottom-0 left-0 h-0.5 rounded-full bg-[#C88A3D] transition-all duration-200",
                      active
                        ? "w-full"
                        : "w-0 group-hover:w-full",
                    ].join(" ")}
                  />

                  {/* =================================================
                      Desktop Dropdown
                      ================================================= */}
                  {link.sub && (
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 8,
                            scale: 0.97,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            y: 8,
                            scale: 0.97,
                          }}
                          transition={{
                            duration: 0.18,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          className="absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-100 bg-white p-2 shadow-xl"
                        >
                          {link.sub.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-[#F8F3EC] hover:text-[#C88A3D]"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          {/* =====================================================
              Desktop Actions
              ===================================================== */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              className="relative flex size-10 items-center justify-center rounded-full text-[#1B263B] transition-colors hover:bg-gray-100 hover:text-[#C88A3D]"
            >
              <Search size={19} />
            </button>

            {/* Wishlist */}
            <button
              type="button"
              aria-label="Wishlist"
              className="relative flex size-10 items-center justify-center rounded-full text-[#1B263B] transition-colors hover:bg-gray-100 hover:text-[#C88A3D]"
            >
              <Heart size={19} />

              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-[#C88A3D] text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <Link
              href="#"
              aria-label="Cart"
              className="relative flex size-10 items-center justify-center rounded-full text-[#1B263B] transition-colors hover:bg-gray-100 hover:text-[#C88A3D]"
            >
              <ShoppingBag size={19} />

              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-[#C88A3D] text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="ml-1 flex size-10 items-center justify-center rounded-full text-[#1B263B] transition-colors hover:bg-gray-100 hover:text-[#C88A3D] lg:hidden"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          Mobile Menu
          ========================================================= */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed inset-y-0 right-0 z-[70] flex w-[88%] max-w-sm flex-col bg-white shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
            >
              {/* Mobile Header */}
              <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-100 px-5">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center"
                >
                  <Image
                    src="/vc_logo.png"
                    alt="Vaishnavi Collections Logo"
                    width={220}
                    height={50}
                    className="h-auto max-h-12 w-auto object-contain"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex size-10 items-center justify-center rounded-full text-[#1B263B] transition-colors hover:bg-gray-100 hover:text-[#C88A3D]"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto px-5 py-6">
                <div className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{
                        opacity: 0,
                        x: 20,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: i * 0.06,
                      }}
                    >
                      <Link
                        href={link.href}
                        className={[
                          "flex items-center justify-between border-b border-gray-100 py-4 text-base font-medium transition-colors",
                          pathname === link.href
                            ? "text-[#C88A3D]"
                            : "text-[#1B263B] hover:text-[#C88A3D]",
                        ].join(" ")}
                        onClick={() =>
                          setMobileOpen(false)
                        }
                      >
                        <span>{link.label}</span>

                        {link.sub && (
                          <ChevronDown
                            size={16}
                            className="text-gray-400"
                          />
                        )}
                      </Link>

                      {/* Mobile Sub Navigation */}
                      {link.sub && (
                        <div className="space-y-1 pb-2 pl-4">
                          {link.sub.slice(1).map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className="block py-2.5 text-sm text-gray-500 transition-colors hover:text-[#C88A3D]"
                              onClick={() =>
                                setMobileOpen(false)
                              }
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </nav>

              {/* Mobile CTA */}
              <div className="border-t border-gray-100 p-5">
                <Link
                  href="/products"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-[#C88A3D] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#B77830] hover:shadow-md"
                >
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