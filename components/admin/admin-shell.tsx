
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  CircleDollarSign,
  FolderTree,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type NavigationLink = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
};

type NavigationItem =
  | NavigationLink
  | {
      name: string;
      icon: typeof LayoutDashboard;
      children: NavigationLink[];
    };

const navigation: NavigationItem[] = [
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
    icon: Boxes,
    children: [
      {
        name: "All Products",
        href: "/admin/products",
        icon: Boxes,
      },
      {
        name: "Categories",
        href: "/admin/products/categories",
        icon: FolderTree,
      },
    ],
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
    name: "Orders",
    icon: ShoppingBag,
    children: [
      {
        name: "All Orders",
        href: "/admin/orders",
        icon: ShoppingBag,
      },
      {
        name: "Returns & Refunds",
        href: "/admin/orders/returns",
        icon: PackageCheck,
      },
    ],
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
    name: "Inventory",
    href: "/admin/inventory",
    icon: Boxes,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    name: "GST Export",
    href: "/admin/gst-reports",
    icon: FileSpreadsheet,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

const bottomNavigation: NavigationLink[] = [
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
];

interface AdminShellProps {
  children: React.ReactNode;
  userEmail: string;
}

interface UserProfile {
  full_name: string | null;
  role: string | null;
}

function isLinkItem(item: NavigationItem): item is NavigationLink {
  return "href" in item;
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {
      Products: pathname.startsWith("/admin/products"),
      Orders: pathname.startsWith("/admin/orders"),
    },
  );

  const [profile, setProfile] = useState<UserProfile>({
    full_name: null,
    role: null,
  });

  const desktopProfileRef = useRef<HTMLDivElement>(null);
  const headerProfileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Admin profile fetch error:", error);
      }

      const metadataName =
        user.user_metadata?.full_name ??
        user.user_metadata?.display_name ??
        null;

      setProfile({
        full_name: profileData?.full_name ?? metadataName,
        role: profileData?.role ?? null,
      });
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      const insideDesktop =
        desktopProfileRef.current?.contains(target) ?? false;
      const insideHeader =
        headerProfileRef.current?.contains(target) ?? false;

      if (!insideDesktop && !insideHeader) {
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

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);

    if (pathname.startsWith("/admin/products")) {
      setExpandedMenus((current) => ({
        ...current,
        Products: true,
      }));
    }

    if (pathname.startsWith("/admin/orders")) {
      setExpandedMenus((current) => ({
        ...current,
        Orders: true,
      }));
    }
  }, [pathname]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
    }

    router.replace("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function isGroupActive(item: NavigationItem) {
    return !isLinkItem(item) && item.children.some((child) => isActive(child.href));
  }

  function toggleMenu(name: string) {
    setExpandedMenus((current) => ({
      ...current,
      [name]: !current[name],
    }));
  }

  const displayName =
    profile.full_name?.trim() || userEmail.split("@")[0] || "Admin";

  // Display only; this is not an authorization check.
  const role = profile.role?.toUpperCase() || "USER";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "U";

  function renderNavigation(mobile = false) {
    return navigation.map((item) => {
      const Icon = item.icon;

      if (isLinkItem(item)) {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => {
              if (mobile) setMobileMenuOpen(false);
            }}
            className={[
              "relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
              active
                ? "bg-white/10 text-brand-white shadow-sm before:absolute before:left-0 before:top-2 before:h-[calc(100%-1rem)] before:w-1 before:rounded-r-full before:bg-brand-gold"
                : "text-brand-gold hover:bg-white/5 hover:text-brand-white",
            ].join(" ")}
          >
            <Icon className="size-5 shrink-0" />
            <span>{item.name}</span>
          </Link>
        );
      }

      const expanded = Boolean(expandedMenus[item.name]);
      const groupActive = isGroupActive(item);

      return (
        <div key={item.name}>
          <button
            type="button"
            onClick={() => toggleMenu(item.name)}
            aria-expanded={expanded}
            className={[
              "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all duration-200",
              groupActive
                ? "bg-white/10 text-brand-white"
                : "text-brand-gold hover:bg-white/5 hover:text-brand-white",
            ].join(" ")}
          >
            <Icon className="size-5 shrink-0" />
            <span className="flex-1">{item.name}</span>
            <ChevronDown
              className={[
                "size-4 shrink-0 transition-transform duration-200",
                expanded ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          {expanded && (
            <div className="ml-5 mt-1 space-y-1 border-l border-white/15 pl-3">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const active = isActive(child.href);

                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      if (mobile) setMobileMenuOpen(false);
                    }}
                    className={[
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-white/10 font-semibold text-brand-white before:absolute before:left-0 before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:rounded-r-full before:bg-brand-gold"
                        : "text-white/70 hover:bg-white/5 hover:text-brand-gold",
                    ].join(" ")}
                  >
                    <ChildIcon className="size-4 shrink-0" />
                    <span>{child.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-brand-navy lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/vc_white_logo.png"
              alt="Vaishnavi Collections"
              width={240}
              height={140}
              priority
            />
          </Link>
        </div>

        <nav
          aria-label="Admin navigation"
          className="flex-1 space-y-1 overflow-y-auto p-4"
        >
          {renderNavigation()}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div ref={desktopProfileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/5"
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-brand-navy">
                {avatarLetter}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-white">
                  {displayName}
                </p>
                <p className="truncate text-xs text-white/50">{userEmail}</p>
              </div>

              <ChevronDown
                className={[
                  "size-4 shrink-0 text-brand-gold transition-transform",
                  profileOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {profileOpen && (
              <div className="absolute bottom-[calc(100%+10px)] left-0 w-72 overflow-hidden rounded-2xl border border-white/10 bg-brand-navy shadow-2xl">
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

                <div className="p-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                        <ShieldCheck className="size-4 text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-[11px] text-white/50">Role</p>
                        <p className="mt-0.5 text-sm font-semibold text-brand-white">
                          {role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

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

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-sm flex-col bg-brand-navy shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <Image
                  src="/vc_white_logo.png"
                  alt="Vaishnavi Collections"
                  width={200}
                  height={80}
                />
              </Link>

              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-brand-gold transition-colors hover:bg-white/5 hover:text-brand-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav
              aria-label="Mobile admin navigation"
              className="flex-1 space-y-1 overflow-y-auto p-4"
            >
              {renderNavigation(true)}
            </nav>

            <div className="border-t border-white/10 p-4">
              <div className="mb-3 flex items-center gap-3 px-2">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-brand-navy">
                  {avatarLetter}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-white">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-white/50">{role}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-gold transition-colors hover:bg-white/5 hover:text-brand-white"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/10 bg-brand-navy px-4 sm:px-5 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-xl p-2 text-brand-gold transition-colors hover:bg-white/5 hover:text-brand-white lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-6" />
          </button>

          <div className="lg:hidden">
            <Image
              src="/vc_white_logo.png"
              alt="Vaishnavi Collections"
              width={200}
              height={80}
            />
          </div>

          <div
            ref={headerProfileRef}
            className="relative ml-auto flex items-center gap-3"
          >
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-white/5"
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-brand-gold text-lg font-semibold text-brand-navy">
                {avatarLetter}
              </div>
            </button>

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
                        <p className="text-[11px] text-slate-500">Role</p>
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

        <main className="admin-page min-h-screen w-full bg-[#F7F7FA] pb-24 lg:pb-0">
          <div className="mx-auto w-full max-w-[1680px] px-3 py-4 sm:px-5 sm:py-6 md:px-7 lg:px-9 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-brand-navy px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] shadow-[0_-8px_24px_rgba(23,27,77,0.16)] lg:hidden"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {bottomNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
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
                    active ? "stroke-[2.5]" : "",
                  ].join(" ")}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
