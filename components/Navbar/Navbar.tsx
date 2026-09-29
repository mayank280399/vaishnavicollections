"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/products",
    sub: [
      { label: "All Products", href: "/products" },
      {
        label: "Laddu Gopal",
        href: "/products?category=Laddu%20Gopal",
      },
      {
        label: "Jewellery",
        href: "/products?category=Jewellery",
      },
      {
        label: "Beauty",
        href: "/products?category=Beauty",
      },
      {
        label: "Home Decor",
        href: "/products?category=Decor",
      },
      {
        label: "Made to Order",
        href: "/contact",
      },
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

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Temporary counts
  const cartCount = 3;
  const wishlistCount = 5;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      setActiveDropdown(null);
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Customer";

  const googleIdentity = user?.identities?.find(
    (identity) => identity.provider === "google"
  );

  const avatarUrl =
    googleIdentity?.identity_data?.avatar_url ||
    googleIdentity?.identity_data?.picture ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part.charAt(0).toUpperCase())
      .join("") || "C";

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      return;
    }

    setUser(null);
    setProfileOpen(false);
    setMobileOpen(false);
    setLoggingOut(false);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setActiveDropdown(null);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
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
            "mx-auto flex w-full max-w-7xl items-center px-3 sm:px-6 lg:px-8",
            "justify-between",
            scrolled ? "h-16" : "h-16 sm:h-20",
          ].join(" ")}
        >
          {/* =========================
              LEFT: MOBILE MENU + LOGO
          ========================== */}
          <div className="flex min-w-0 flex-1 items-center lg:flex-none">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-[#171B4D] transition-colors hover:bg-gray-100 hover:text-[#C9952E] sm:mr-2 sm:size-10 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <Link
              href="/"
              className="flex min-w-0 shrink items-center"
              onClick={() => setMobileOpen(false)}
            >
              <Image
                src="/vc_logo.png"
                loading="eager"
                alt="Vaishnavi Collections Logo"
                width={300}
                height={55}
                className={[
                  "h-auto w-auto object-contain transition-all duration-300",
                  "max-h-10 max-w-[145px]",
                  "sm:max-h-12 sm:max-w-[200px]",
                  "lg:max-h-14 lg:max-w-[220px]",
                ].join(" ")}
              />
            </Link>
          </div>

          {/* =========================
              DESKTOP NAVIGATION
          ========================== */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => {
              const hasSub = !!link.sub?.length;

              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() =>
                    hasSub && setActiveDropdown(link.label)
                  }
                  onMouseLeave={() =>
                    hasSub && setActiveDropdown(null)
                  }
                >
                  <Link
                    href={link.href}
                    className={[
                      "flex items-center gap-1 py-2 text-sm font-medium transition-colors",
                      isActive(link.href)
                        ? "text-[#C9952E]"
                        : "text-[#171B4D] hover:text-[#C9952E]",
                    ].join(" ")}
                  >
                    {link.label}

                    {hasSub && (
                      <ChevronDown
                        size={15}
                        className={[
                          "transition-transform duration-200",
                          activeDropdown === link.label
                            ? "rotate-180"
                            : "",
                        ].join(" ")}
                      />
                    )}
                  </Link>

                  {hasSub && (
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className="absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3"
                        >
                          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                            {link.sub?.map((subLink) => (
                              <Link
                                key={subLink.label}
                                href={subLink.href}
                                className="block rounded-xl px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-[#171B4D]/5 hover:text-[#C9952E]"
                              >
                                {subLink.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          {/* =========================
              RIGHT ACTIONS
          ========================== */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Search */}
            <Link
              href="/products"
              aria-label="Search products"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#171B4D] transition-colors hover:bg-gray-100 hover:text-[#C9952E] sm:size-10"
            >
              <Search size={20} />
            </Link>

            {/* Wishlist - Desktop only */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden size-10 shrink-0 items-center justify-center rounded-full text-[#171B4D] transition-colors hover:bg-gray-100 hover:text-[#C9952E] lg:flex"
            >
              <Heart size={20} />

              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-[#C9952E] px-1 text-[10px] font-bold leading-4 text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative flex size-9 shrink-0 items-center justify-center rounded-full text-[#171B4D] transition-colors hover:bg-gray-100 hover:text-[#C9952E] sm:size-10"
            >
              <ShoppingBag size={20} />

              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-[#C9952E] px-1 text-[10px] font-bold leading-4 text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label={user ? "Open profile menu" : "Login"}
                className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#171B4D]/10 bg-[#171B4D]/5 text-[#171B4D] transition-all hover:border-[#C9952E] hover:text-[#C9952E] sm:size-10"
              >
                {user ? (
                  avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={40}
                      height={40}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold">
                      {initials}
                    </span>
                  )
                ) : (
                  <User size={19} />
                )}
              </button>

              {/* Desktop profile popup */}
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
                    >
                      {user ? (
                        <>
                          <div className="border-b border-gray-100 p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#171B4D]/5 text-[#171B4D]">
                                {avatarUrl ? (
                                  <Image
                                    src={avatarUrl}
                                    alt={displayName}
                                    width={44}
                                    height={44}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-bold">
                                    {initials}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#171B4D]">
                                  {displayName}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-2">
                            <Link
                              href="/account"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#C9952E]"
                            >
                              <User size={18} />
                              My Account
                            </Link>

                            <Link
                              href="/wishlist"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#C9952E]"
                            >
                              <Heart size={18} />
                              Wishlist
                            </Link>

                            <button
                              type="button"
                              onClick={handleLogout}
                              disabled={loggingOut}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                            >
                              <X size={18} />
                              {loggingOut ? "Logging out..." : "Logout"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-4">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-full bg-[#171B4D]/5 text-[#171B4D]">
                              <User size={20} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-[#171B4D]">
                                Welcome
                              </p>
                              <p className="text-xs text-gray-500">
                                Sign in to your account
                              </p>
                            </div>
                          </div>

                          <Link
                            href="/login"
                            onClick={() => setProfileOpen(false)}
                            className="flex w-full items-center justify-center rounded-xl bg-[#171B4D] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C9952E]"
                          >
                            Login / Sign Up
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* =========================
          MOBILE DRAWER
      ========================== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed inset-y-0 left-0 z-[70] flex w-[88%] max-w-sm flex-col overflow-hidden bg-white shadow-[8px_0_30px_rgba(0,0,0,0.12)]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
            >
              {/* Drawer Header - Fixed */}
              <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-100 px-5">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center"
                >
                  <Image
                    src="/vc_logo.png"
                    alt="Vaishnavi Collections Logo"
                    width={220}
                    height={45}
                    className="h-auto max-h-11 w-auto max-w-[180px] object-contain"
                  />
                </Link>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                  className="flex size-10 items-center justify-center rounded-full text-[#171B4D] transition-colors hover:bg-gray-100 hover:text-[#C9952E]"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Scrollable Drawer Content */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
                {/* Account */}
                {user ? (
                  <div className="mb-5 rounded-2xl bg-[#171B4D] p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#C9952E] bg-white/10">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={displayName}
                            width={48}
                            height={48}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-[#C9952E]">
                            {initials}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-white/60">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="mt-4 flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:opacity-50"
                    >
                      {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                ) : (
                  <div className="mb-5 rounded-2xl border border-[#C9952E]/20 bg-[#C9952E]/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#171B4D] text-white">
                        <User size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#171B4D]">
                          Welcome to Vaishnavi Collections
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Login to manage your account
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#171B4D] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C9952E]"
                    >
                      Login / Sign Up
                    </Link>
                  </div>
                )}

                {/* Navigation */}
                <nav className="space-y-1">
                  {/* Home */}
                  <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className={[
                      "flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-colors",
                      pathname === "/"
                        ? "bg-[#171B4D]/5 text-[#C9952E]"
                        : "text-[#171B4D] hover:bg-gray-50 hover:text-[#C9952E]",
                    ].join(" ")}
                  >
                    Home
                  </Link>

                  {/* Shop Accordion */}
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdown((prev) =>
                          prev === "mobile-shop" ? null : "mobile-shop"
                        )
                      }
                      className={[
                        "flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-colors",
                        activeDropdown === "mobile-shop"
                          ? "bg-[#171B4D]/5 text-[#C9952E]"
                          : "text-[#171B4D] hover:bg-gray-50 hover:text-[#C9952E]",
                      ].join(" ")}
                    >
                      <span>Shop</span>

                      <ChevronDown
                        size={18}
                        className={[
                          "transition-transform duration-200",
                          activeDropdown === "mobile-shop"
                            ? "rotate-180"
                            : "",
                        ].join(" ")}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {activeDropdown === "mobile-shop" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 space-y-1 border-l border-[#C9952E]/20 py-1 pl-3">
                            {navLinks[1].sub?.map((subLink) => (
                              <Link
                                key={subLink.label}
                                href={subLink.href}
                                onClick={closeMobileMenu}
                                className="block rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#C9952E]"
                              >
                                {subLink.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* About */}
                  <Link
                    href="/about"
                    onClick={closeMobileMenu}
                    className={[
                      "flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-colors",
                      isActive("/about")
                        ? "bg-[#171B4D]/5 text-[#C9952E]"
                        : "text-[#171B4D] hover:bg-gray-50 hover:text-[#C9952E]",
                    ].join(" ")}
                  >
                    About
                  </Link>

                  {/* Contact */}
                  <Link
                    href="/contact"
                    onClick={closeMobileMenu}
                    className={[
                      "flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-colors",
                      isActive("/contact")
                        ? "bg-[#171B4D]/5 text-[#C9952E]"
                        : "text-[#171B4D] hover:bg-gray-50 hover:text-[#C9952E]",
                    ].join(" ")}
                  >
                    Contact
                  </Link>
                </nav>

                {/* Shopping Shortcuts */}
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                    Your Shopping
                  </p>

                  <div className="space-y-1">
                    <Link
                      href="/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#171B4D] transition-colors hover:bg-gray-50 hover:text-[#C9952E]"
                    >
                      <span className="flex items-center gap-3">
                        <Heart size={19} />
                        Wishlist
                      </span>

                      {wishlistCount > 0 && (
                        <span className="rounded-full bg-[#C9952E]/10 px-2 py-0.5 text-xs font-semibold text-[#C9952E]">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/cart"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#171B4D] transition-colors hover:bg-gray-50 hover:text-[#C9952E]"
                    >
                      <span className="flex items-center gap-3">
                        <ShoppingBag size={19} />
                        Cart
                      </span>

                      {cartCount > 0 && (
                        <span className="rounded-full bg-[#C9952E]/10 px-2 py-0.5 text-xs font-semibold text-[#C9952E]">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>

                {/* Small Brand Message */}
                <div className="mt-6 rounded-2xl border border-[#C9952E]/15 bg-[#C9952E]/5 p-4">
                  <div className="flex items-center gap-2 text-[#C9952E]">
                    <Sparkles size={17} />

                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Vaishnavi Collections
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Discover beautiful products for your home, devotion,
                    beauty and everyday style.
                  </p>
                </div>

                {/* Extra bottom spacing for scroll comfort */}
                <div className="h-4" />
              </div>

              {/* Bottom CTA - Fixed */}
              <div className="shrink-0 border-t border-gray-100 bg-white p-4">
                <Link
                  href="/products"
                  onClick={closeMobileMenu}
                  className="flex w-full items-center justify-center rounded-xl bg-[#171B4D] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#C9952E]"
                >
                  Shop Now
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}