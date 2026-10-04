"use client";

import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  customer: {
    display_name: string | null;
    email: string | null;
    phone: string | null;
  };
  initials: string;
};

export default function AccountHeader({
  customer,
  initials,
}: Props) {
  const supabase = createClient();

  const firstName =
    customer.display_name?.trim().split(" ")[0] || "there";

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-[#071A35] text-white shadow-sm">
      <div className="relative px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-lg font-semibold text-[#D4AF37]">
              {initials}
            </div>

            <div>
              <p className="text-sm text-white/60">
                Welcome back
              </p>

              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
                {firstName} 👋
              </h1>

              <p className="mt-1 text-sm text-white/65">
                Your Vaishnavi Collections account
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-[#071A35] transition hover:bg-[#e2c451]"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}