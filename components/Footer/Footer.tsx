import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  Phone,
} from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { createClient } from "@/lib/supabase/server";
import FloatingWhatsApp from "../FloatingWhatsApp/FloatingWhatsApp";

export default async function Footer() {
  const supabase = await createClient();

  const { data: settings, error } = await supabase
    .from("public_store_settings")
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Footer settings error:", error);
  }

  const fullAddress = [
    settings?.address_line_1,
    settings?.city,
    settings?.state,
    settings?.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  const phone = settings?.primary_phone || "";
  const whatsapp =
    settings?.whatsapp_number ||
    settings?.primary_phone ||
    "";

  const instagram =
    settings?.instagram_enabled
      ? settings?.instagram_url || ""
      : "";

  const mapsUrl = settings?.google_business_url || "";

  const madeToOrderEnabled =
    settings?.order_preparation_enabled ?? false;

  const panIndiaShipping =
    settings?.pan_india_shipping_enabled ?? false;

  const shopName =
    settings?.shop_name || "Vaishnavi Collections";

  return (
    <footer className="w-full bg-[#071A35] text-white">
        <FloatingWhatsApp phone={whatsapp} />
      {/* =========================================================
          FEATURE STRIP
      ========================================================== */}

      <div className="border-b border-white/10 bg-[#0A2142]">
        <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
          <div className="grid grid-cols-2 gap-y-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Feature 1 */}
            {panIndiaShipping && (
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="
                  flex h-11 w-11 shrink-0 items-center justify-center
                  rounded-xl
                  border border-[#D4AF37]/25
                  bg-[#D4AF37]/10
                  text-[#D4AF37]
                  sm:h-12 sm:w-12
                "
              >
                <Truck size={22} strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white sm:text-sm">
                  Pan India Shipping
                </h3>

                <p className="mt-1 text-[10px] leading-4 text-white/50 sm:text-xs">
                  We deliver across India
                </p>
              </div>
            </div>
            )}
            
            {/* Feature 2 */}
            {madeToOrderEnabled && (
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="
                  flex h-11 w-11 shrink-0 items-center justify-center
                  rounded-xl
                  border border-[#D4AF37]/25
                  bg-[#D4AF37]/10
                  text-[#D4AF37]
                  sm:h-12 sm:w-12
                "
              >
                <Sparkles size={22} strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white sm:text-sm">
                  Made to Order
                </h3>

                <p className="mt-1 text-[10px] leading-4 text-white/50 sm:text-xs">
                  Selected items prepared on request
                </p>
              </div>
            </div>
            )}
            {/* Feature 3 */}

            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="
                  flex h-11 w-11 shrink-0 items-center justify-center
                  rounded-xl
                  border border-[#D4AF37]/25
                  bg-[#D4AF37]/10
                  text-[#D4AF37]
                  sm:h-12 sm:w-12
                "
              >
                <ShieldCheck size={22} strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white sm:text-sm">
                  Secure Payments
                </h3>

                <p className="mt-1 text-[10px] leading-4 text-white/50 sm:text-xs">
                  Safe & trusted checkout
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="
                  flex h-11 w-11 shrink-0 items-center justify-center
                  rounded-xl
                  border border-[#D4AF37]/25
                  bg-[#D4AF37]/10
                  text-[#D4AF37]
                  sm:h-12 sm:w-12
                "
              >
                <HeartHandshake size={22} strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white sm:text-sm">
                  Personal Assistance
                </h3>

                <p className="mt-1 text-[10px] leading-4 text-white/50 sm:text-xs">
                  We're happy to help with orders
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN FOOTER
      ========================================================== */}

      <div className="bg-[#071A35]">
        <div className="mx-auto w-full max-w-7xl px-4 py-11 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div
            className="
              grid
              grid-cols-1
              gap-10

              sm:grid-cols-2
              sm:gap-x-10
              sm:gap-y-12

              lg:grid-cols-[1.45fr_1fr_1fr_1.25fr]
              lg:gap-12
            "
          >
            {/* =====================================================
                BRAND
            ====================================================== */}

            <div>
              <Link
                href="/"
                className="inline-flex items-center"
                aria-label="Vaishnavi Collections home"
              >
                <Image
                  src="/vc_white_logo.png"
                  alt="Vaishnavi Collections"
                  width={220}
                  height={74}
                  loading="eager"
                  className="h-auto w-[170px] object-contain sm:w-[195px]"
                />
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">
                Discover beautiful pieces for your home, your style and your
                Kanha Ji. Vaishnavi Collections brings together home decor,
                beauty essentials, accessories and Laddu Gopal poshak &
                shringar — with selected products prepared on order.
              </p>

              {/* Social / Contact */}
              <div className="mt-6 flex items-center gap-3">
                {phone && (
                <Link
                   href={`tel:${phone}`}
                   aria-label={`Call ${shopName}`}
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-full
                    border border-white/10
                    bg-white/5
                    text-white/65
                    transition-all duration-300
                    hover:border-[#D4AF37]/50
                    hover:bg-[#D4AF37]
                    hover:text-[#071A35]
                  "
                >
                  <Phone size={17} />
                </Link>
                )}
                {mapsUrl && (
                <Link
                  href={mapsUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Find ${shopName}`}
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-full
                    border border-white/10
                    bg-white/5
                    text-white/65
                    transition-all duration-300
                    hover:border-[#D4AF37]/50
                    hover:bg-[#D4AF37]
                    hover:text-[#071A35]
                  "
                >
                  <MapPin size={17} />
                </Link>
)}
               {whatsapp && (
  <a
    href={`https://wa.me/91${whatsapp.replace(/\D/g, "")}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`WhatsApp ${shopName}`}
    className="
      flex h-10 w-10 items-center justify-center
      rounded-full
      border border-white/10
      bg-white/5
      text-white/65
      transition-all duration-300
      hover:border-[#D4AF37]/50
      hover:bg-[#D4AF37]
      hover:text-[#071A35]
    "
  >
    <FaWhatsapp size={18} />
  </a>
)}
                {instagram && (
                   <Link
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${shopName} on Instagram`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 transition-all duration-300 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37] hover:text-[#071A35]"
                >
                  <FaInstagram size={18} />
                </Link>
                )}
               
              </div>
            </div>

            {/* =====================================================
                SHOP
            ====================================================== */}

            <div>
              <h3
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-[#D4AF37]
                "
              >
                Shop
              </h3>

              <nav className="mt-5 flex flex-col gap-3">
                <Link
                  href="/products"
                  className="group flex items-center gap-1.5 text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                >
                  All Products
                  <ArrowRight
                    size={12}
                    className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </Link>

                <Link
                  href="/collections/laddu-gopal"
                  className="group flex items-center gap-1.5 text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                >
                  Laddu Gopal
                  <ArrowRight
                    size={12}
                    className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </Link>

                <Link
                  href="/products?category=home-decor"
                  className="group flex items-center gap-1.5 text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                >
                  Home Decor
                  <ArrowRight
                    size={12}
                    className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </Link>

                <Link
                  href="/products?category=hair-accessories"
                  className="group flex items-center gap-1.5 text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                >
                  Hair Accessories
                  <ArrowRight
                    size={12}
                    className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </Link>

                <Link
                  href="/products?category=cosmetics-beauty"
                  className="group flex items-center gap-1.5 text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                >
                  Cosmetics & Beauty
                  <ArrowRight
                    size={12}
                    className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </Link>

                <Link
                  href="/products?category=artificial-jewellery"
                  className="group flex items-center gap-1.5 text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                >
                  Artificial Jewellery
                  <ArrowRight
                    size={12}
                    className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </Link>
              </nav>
            </div>

            {/* =====================================================
                INFORMATION
            ====================================================== */}

            <div>
              <h3
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-[#D4AF37]
                "
              >
                Information
              </h3>

              <nav className="mt-5 flex flex-col gap-3">
                <Link
                  href="/about"
                  className="text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                >
                  Our Story
                </Link>

                <Link
                  href="/contact"
                  className="text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                >
                  Contact Us
                </Link>

                <Link
                  href="/shipping-policy"
                  className="text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                >
                  Shipping Policy
                </Link>

                <Link
                  href="/terms"
                  className="text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                >
                  Terms of Service
                </Link>
                <Link href="/refund-returns"
                  className="text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                > Refunds & Returns
                </Link>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-white/55 transition-colors duration-200 hover:text-[#D4AF37]"
                >
                  Privacy Policy
                </Link>
              </nav>
            </div>

            {/* =====================================================
                CONTACT / MADE TO ORDER
            ====================================================== */}

            <div>
              <h3
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-[#D4AF37]
                "
              >
                Need Help?
              </h3>

              <p className="mt-5 text-sm leading-6 text-white/55">
                Looking for something specific or interested in a
                made-to-order item? Get in touch with us and we'll be happy
                to assist.
              </p>

              <Link
                href="/contact"
                className="
                  group
                  mt-5
                  inline-flex
                  min-h-11
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#D4AF37]
                  px-5
                  py-2.5
                  text-xs
                  font-semibold
                  text-[#071A35]
                  shadow-lg
                  shadow-black/10
                  transition-all
                  duration-300
                  hover:bg-[#E4C76A]
                  hover:shadow-xl
                "
              >
                Contact Us

                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <HeartHandshake
                    size={18}
                    className="mt-0.5 shrink-0 text-[#D4AF37]"
                  />

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Made with care
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-white/45">
                      From everyday essentials to special pieces for your
                      home and Kanha Ji.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM BAR
      ========================================================== */}

      <div className="border-t border-white/10 bg-[#06162D]">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="text-[11px] text-white/40 sm:text-xs">
              © {new Date().getFullYear()} Vaishnavi Collections. All rights
              reserved.
            </p>

            <p className="text-[10px] text-white/30 sm:text-xs">
              Home • Beauty • Accessories • Devotional
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}