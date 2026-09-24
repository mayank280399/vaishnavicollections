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
} from "lucide-react";
import { useState } from "react";
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

export function AdminShell({
  children,
  userEmail,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
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

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      {/* =========================================
          Desktop Sidebar
          ========================================= */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-brand-navy lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/admin" className="flex items-center gap-3">      
            <Image src="/vc_white_logo.png" alt="Logo" width={240} height={140} />
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

                  /* Active */
                  active
                    ? "bg-brand-navy text-brand-white shadow-sm before:absolute before:left-0 before:top-2 before:h-[calc(100%-1rem)] before:w-1 before:rounded-r-full before:bg-brand-gold"

                    /* Inactive */
                    : "text-brand-gold hover:bg-white/5 hover:text-brand-white",
                ].join(" ")}
              >
                <Icon className="size-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="border-t border-white/10 p-4">
          {/* Signed In Card */}
          <div className="mb-3 rounded-xl bg-white/5 p-3">
            <p className="truncate text-xs text-white/50">
              Signed in as
            </p>

            <p className="mt-1 truncate text-sm font-medium text-brand-white">
              {userEmail}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-brand-gold transition-colors hover:bg-white/5 hover:text-brand-white"
          >
            <LogOut className="size-5" />
            Logout
          </button>
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
             

                {/* <div>
                  <p className="text-sm font-semibold text-brand-white">
                    Vaishnavi
                  </p>

                  <p className="text-xs text-brand-gold">
                    Collections
                  </p>
                </div> */}
                <Image src="/vc_white_logo.png" alt="Logo" width={200} height={80} />
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

            {/* Mobile Logout */}
            <div className="border-t border-white/10 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-brand-gold transition-colors hover:bg-white/5 hover:text-brand-white"
              >
                <LogOut className="size-5" />
                Logout
              </button>
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
            <Image src="/vc_white_logo.png" alt="Logo" width={200} height={80} />
          </div>

          {/* User */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-white/50">
                Admin
              </p>

              <p className="max-w-48 truncate text-sm font-medium text-brand-white">
                {userEmail}
              </p>
            </div>

            {/* Avatar */}
            <div className="flex size-9 items-center justify-center rounded-full bg-brand-gold text-sm font-semibold text-brand-navy">
              {userEmail.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
       <main className="min-h-screen w-full bg-background pb-20 lg:pb-0 ">
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
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium text-brand-gold transition-colors hover:text-brand-white"
          >
            <Menu className="size-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}