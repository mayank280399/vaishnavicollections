"use client";

import React from "react";
import {
  ChevronRight,
  Headphones,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export default function AccountHelpCard() {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#eadfbf] bg-white shadow-sm">
      <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#071A35] text-[#D4AF37]">
            <Headphones size={22} />
          </div>

          <div>
            <h2 className="font-bold text-[#071A35]">
              Need a little help?
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
              We’re happy to help with your orders, products,
              delivery, or rewards.
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={14} />
                Secure account
              </span>

              <span className="inline-flex items-center gap-1">
                <MessageCircle size={14} />
                Personal support
              </span>
            </div>
          </div>
        </div>

        <a
          href="https://wa.me/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A35] px-5 py-3 text-sm font-semibold text-white"
        >
          Contact us
          <ChevronRight size={16} />
        </a>
      </div>
    </section>
  );
}