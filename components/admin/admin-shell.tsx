"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Sparkles,
  ShoppingCart,
  Users,
  X,
  Settings,
  User,
  ShieldCheck,
  ChevronUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Sales",
    href: "/admin/sales",
    icon: Receipt,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Boxes,
  },
  {
    name: "Expenses",
    href: "/admin/expenses",
    icon: CircleDollarSign,
  },
  {
    name: "Purchases",
    href: "/admin/purchases",
    icon: ShoppingCart,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Loyalty",
    href: "/admin/loyalty",
    icon: Sparkles,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminShellProps {
  children: React.ReactNode;
  userEmail: string;
}

interface UserProfile {
  display_name: string | null;
  role: string | null;
}

export function AdminShell({
  children,
  userEmail,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    display_name: null,
    role: null,
  });

  const profileRef = useRef<HTMLDivElement>(null);

  /*
   * Load logged-in user's profile
   */
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      /*
       * Display name can come from auth metadata.
       */
      const metadataDisplayName =
        user.user_metadata?.display_name ??
        user.user_metadata?.full_name ??
        null;

      /*
       * Role comes from profiles table.
       */
      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", user.id)
        .maybeSingle();

      setProfile({
        display_name:
          profileData?.display_name ?? metadataDisplayName,
        role: profileData?.role ?? null,
      });
    }

    loadProfile();
  }, [supabase]);

  /*
   * Close profile popup when clicking outside
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  async function handleLogout() {
    //setProfileOpen(false);

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  const displayName =
    profile.display_name ||
    userEmail.split("@")[0] ||
    "Admin";

  const role =
    profile.role?.toUpperCase() || "ADMIN";

  const avatarLetter =
    displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      {/* =========================================
          Desktop Sidebar
          ========================================= */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-brand-navy lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/vc_white_logo.png"
              alt="Logo"
              width={240}
              height={140}
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-brand-navy text-brand-white shadow-sm before:absolute before:left-0 before:top-2 before:h-[calc(100%-1rem)] before:w-1 before:rounded-r-full before:bg-brand-gold"
                    : "text-brand-gold hover:bg-white/5 hover:text-brand-white",
                ].join(" ")}
              >
                <Icon className="size-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/10 p-4">
          <div
            ref={profileRef}
            className="relative"
          >
            {/* User Trigger */}
            <button
              type="button"
              onClick={() =>
                setProfileOpen((open) => !open)
              }
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/5"
              aria-expanded={profileOpen}
            >
              {/* Avatar */}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-brand-navy">
                {avatarLetter}
              </div>

              {/* User Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-white">
                  {displayName}
                </p>

                <p className="truncate text-xs text-white/50">
                  {userEmail}
                </p>
              </div>

              <ChevronUp
                className={[
                  "size-4 shrink-0 text-brand-gold transition-transform",
                  profileOpen ? "rotate-0" : "rotate-180",
                ].join(" ")}
              />
            </button>

            {/* Profile Popover */}
            {profileOpen && (
              <div className="absolute bottom-[calc(100%+10px)] left-0 w-72 overflow-hidden rounded-2xl border border-white/10 bg-brand-navy shadow-2xl">
                {/* Header */}
                <div className="border-b border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-gold text-base font-bold text-brand-navy">
                      {avatarLetter}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-white">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-white/50">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                        <ShieldCheck className="size-4 text-brand-gold" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] text-white/50">
                          Role
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-brand-white">
                          {role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logout */}
                <div className="border-t border-white/10 p-3">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-gold transition-colors hover:bg-white/5 hover:text-brand-white"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================
          Mobile Drawer
          ========================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-sm flex-col bg-brand-navy shadow-xl">
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <Image
                  src="/vc_white_logo.png"
                  alt="Logo"
                  width={200}
                  height={80}
                />
              </Link>

              <button
                aria-label="Close navigation"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-brand-gold transition-colors hover:bg-white/5 hover:text-brand-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={[
                      "relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-brand-navy text-brand-white before:absolute before:left-0 before:top-2 before:h-[calc(100%-1rem)] before:w-1 before:rounded-r-full before:bg-brand-gold"
                        : "text-brand-gold hover:bg-white/5 hover:text-brand-white",
                    ].join(" ")}
                  >
                    <Icon className="size-5 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User */}
            <div className="border-t border-white/10 p-4">
              <div
                ref={!profileRef.current ? profileRef : undefined}
                className="relative"
              >
                 <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-gold transition-colors hover:bg-white/5 hover:text-brand-white"
                      >
                        <LogOut className="size-4" />
                        Logout
                      </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* =========================================
          Main Area
          ========================================= */}
      <div className="min-w-0 lg:pl-64">
        {/* Mobile / Tablet Header */}
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/10 bg-brand-navy px-4 sm:px-5 lg:px-8">
          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-xl p-2 text-brand-gold transition-colors hover:bg-white/5 hover:text-brand-white lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-6" />
          </button>

          {/* Mobile Brand */}
          <div className="lg:hidden">
            <Image
              src="/vc_white_logo.png"
              alt="Logo"
              width={200}
              height={80}
            />
          </div>

          {/* User */}
          <div
            ref={profileRef}
            className="relative ml-auto flex items-center gap-3"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen((open) => !open)
              }
              className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/5"
              aria-expanded={profileOpen}
            >
              {/* <div className="hidden text-right sm:block">
                <p className="text-xs text-white/50">
                  {role}
                </p>

                <p className="max-w-48 truncate text-sm font-medium text-brand-white">
                  {displayName}
                </p>
              </div> */}

              {/* Avatar */}
              <div className="flex size-9 items-center justify-center rounded-full bg-brand-gold text-sm font-semibold text-brand-navy text-[28px]">
                {avatarLetter}
              </div>
            </button>

            {/* Mobile / Tablet Profile Popover */}
            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-gold text-base font-bold text-brand-navy">
                      {avatarLetter}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-white shadow-sm">
                        <ShieldCheck className="size-4 text-brand-navy" />
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500">
                          Role
                        </p>

                        <p className="text-sm font-semibold text-slate-900">
                          {role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-3">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen w-full bg-background pb-20 lg:pb-0">
          <div className="mx-auto w-full px-4 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* =========================================
          Mobile Bottom Navigation
          ========================================= */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-brand-navy px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "relative flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                  active
                    ? "text-brand-white after:absolute after:-bottom-2 after:h-1 after:w-6 after:rounded-t-full after:bg-brand-gold"
                    : "text-brand-gold hover:text-brand-white",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "size-5",
                    active && "stroke-[2.5]",
                  ].join(" ")}
                />

                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* More */}
          {/* <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium text-brand-gold transition-colors hover:text-brand-white"
          >
            <Menu className="size-5" />
            <span>More</span>
          </button> */}
        </div>
      </nav>
    </div>
  );
}