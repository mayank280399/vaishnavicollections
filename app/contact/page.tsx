"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<
    null | "sending" | "sent"
  >(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setFormStatus("sending");

    setTimeout(() => {
      setFormStatus("sent");
    }, 1500);
  };

  return (
    <>
      <Navbar />

      <main className="w-full overflow-hidden">
        {/* =========================================================
            HERO SECTION
        ========================================================== */}
        <section className="relative overflow-hidden bg-[#1B263B] px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#C88A3D]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

          <div className="relative mx-auto w-full max-w-7xl">
            <motion.div
              className="max-w-2xl"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="mb-5 inline-flex items-center rounded-full border border-[#C88A3D]/30 bg-[#C88A3D]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C88A3D]">
                Contact Us
              </span>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Get in{" "}
                <span className="text-[#C88A3D]">touch.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                Have a question about our products or your order? We&apos;re
                here to help.
              </p>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
            CONTACT SECTION
        ========================================================== */}
        <section className="bg-[#F8F7F4] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)] lg:gap-12">
              {/* ===================================================
                  FORM
              ==================================================== */}
              <motion.div
                className="rounded-3xl border border-[#1B263B]/10 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-8">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C88A3D]">
                    Message Us
                  </span>

                  <h2 className="mt-2 text-2xl font-bold text-[#1B263B] sm:text-3xl">
                    Send us a message
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#1B263B]/55 sm:text-base">
                    Fill in the details below and we&apos;ll get back to you.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name + Email */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-[#1B263B]"
                      >
                        Full Name
                      </label>

                      <input
                        type="text"
                        id="name"
                        placeholder="Your name"
                        required
                        className="h-12 w-full rounded-xl border border-[#1B263B]/15 bg-white px-4 text-sm text-[#1B263B] outline-none transition placeholder:text-[#1B263B]/35 focus:border-[#C88A3D] focus:ring-2 focus:ring-[#C88A3D]/15"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-[#1B263B]"
                      >
                        Email Address
                      </label>

                      <input
                        type="email"
                        id="email"
                        placeholder="you@example.com"
                        required
                        className="h-12 w-full rounded-xl border border-[#1B263B]/15 bg-white px-4 text-sm text-[#1B263B] outline-none transition placeholder:text-[#1B263B]/35 focus:border-[#C88A3D] focus:ring-2 focus:ring-[#C88A3D]/15"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-sm font-medium text-[#1B263B]"
                    >
                      Subject
                    </label>

                    <select
                      id="subject"
                      className="h-12 w-full rounded-xl border border-[#1B263B]/15 bg-white px-4 text-sm text-[#1B263B] outline-none transition focus:border-[#C88A3D] focus:ring-2 focus:ring-[#C88A3D]/15"
                    >
                      <option>General Inquiry</option>
                      <option>Order Support</option>
                      <option>Product Inquiry</option>
                      <option>Returns & Exchanges</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium text-[#1B263B]"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      rows={5}
                      placeholder="How can we help you?"
                      required
                      className="w-full resize-none rounded-xl border border-[#1B263B]/15 bg-white px-4 py-3 text-sm text-[#1B263B] outline-none transition placeholder:text-[#1B263B]/35 focus:border-[#C88A3D] focus:ring-2 focus:ring-[#C88A3D]/15"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={formStatus !== null}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C88A3D] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B77830] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  >
                    {formStatus === "sent" ? (
                      "Message Sent!"
                    ) : formStatus === "sending" ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* ===================================================
                  CONTACT INFORMATION
              ==================================================== */}
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Email */}
                <div className="flex gap-4 rounded-2xl border border-[#1B263B]/10 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C88A3D]/10 text-[#C88A3D]">
                    <Mail size={23} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#1B263B]">
                      Email Us
                    </h3>

                    <p className="mt-1 break-all text-sm text-[#1B263B]/70">
                      YOUR_EMAIL@example.com
                    </p>

                    <span className="mt-1 block text-xs text-[#1B263B]/45">
                      We&apos;ll respond as soon as possible
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4 rounded-2xl border border-[#1B263B]/10 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C88A3D]/10 text-[#C88A3D]">
                    <Phone size={23} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#1B263B]">
                      Call Us
                    </h3>

                    <p className="mt-1 text-sm text-[#1B263B]/70">
                      YOUR_PHONE_NUMBER
                    </p>

                    <span className="mt-1 block text-xs text-[#1B263B]/45">
                      Contact us during business hours
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex gap-4 rounded-2xl border border-[#1B263B]/10 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C88A3D]/10 text-[#C88A3D]">
                    <MapPin size={23} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#1B263B]">
                      Visit Us
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#1B263B]/70">
                      YOUR_SHOP_ADDRESS
                    </p>

                    <span className="mt-1 block text-xs text-[#1B263B]/45">
                      Visit our store
                    </span>
                  </div>
                </div>

                {/* Live Chat */}
                <div className="relative overflow-hidden rounded-2xl bg-[#1B263B] p-6 text-white shadow-sm">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#C88A3D]/20 blur-2xl" />

                  <div className="relative flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C88A3D] text-white">
                      <MessageCircle size={23} />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Need immediate help?
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-white/60">
                        Contact us directly for assistance with your order or
                        products.
                      </p>

                      <button
                        type="button"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#C88A3D] transition hover:text-white"
                      >
                        Start Live Chat
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}