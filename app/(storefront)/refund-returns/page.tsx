import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  MessageCircle,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description:
    "Read the Vaishnavi Collections return, refund, exchange, cancellation, and damaged product policy.",
  alternates: { canonical: "/refund-returns" },
};

const sections = [
  {
    id: "returns",
    title: "Returns",
  },
  {
    id: "damaged-defective",
    title: "Damaged, Defective or Incorrect Products",
  },
  {
    id: "non-returnable",
    title: "Products That Cannot Be Returned",
  },
  {
    id: "return-process",
    title: "How to Request a Return",
  },
  {
    id: "refunds",
    title: "Refunds",
  },
  {
    id: "partial-refunds",
    title: "Partial Refunds",
  },
  {
    id: "shipping-cod",
    title: "Shipping and COD Charges",
  },
  {
    id: "exchanges",
    title: "Exchanges",
  },
  {
    id: "cancellation",
    title: "Order Cancellation",
  },
  {
    id: "unboxing",
    title: "Important Note About Unboxing Videos",
  },
  {
    id: "declined",
    title: "When a Return or Refund May Be Declined",
  },
  {
    id: "help",
    title: "Need Help?",
  },
];

export default function RefundReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section
        className="
          policy-hero
          relative
          z-0
          overflow-visible
          bg-[#071A35]
          pb-32
          text-white
        "
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_35%)]" />

        <div
          className="
            relative
            mx-auto
            max-w-6xl
            px-4
            py-12
            sm:px-6
            sm:py-16
            lg:px-8
          "
        >
          <div className="max-w-3xl">
            <Link
              href="/"
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                text-sm
                font-medium
                text-slate-300
                transition
                hover:text-[#D4AF37]
              "
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] ring-1 ring-[#D4AF37]/30">
                <FileText className="h-5 w-5" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
                Customer Policy
              </p>
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Return &amp; Refund Policy
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              We want you to shop with confidence. Here&apos;s everything you
              need to know about returns, refunds, exchanges and cancellations
              at Vaishnavi Collections.
            </p>

            <p className="mt-5 text-sm text-slate-400">
              Last updated: 1 October 2026
            </p>
          </div>
        </div>
      </section>

      {/* Quick highlights */}
      <section
        className="
          policy-highlights
          relative
          z-20
          -mt-10
          mx-auto
          max-w-6xl
          px-4
          sm:-mt-12
          sm:px-6
          lg:px-8
        "
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HighlightCard
            icon={<PackageCheck className="h-5 w-5" />}
            title="3-Day Returns"
            description="Eligible products can be returned within 3 days."
          />

          <HighlightCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Unboxing Video"
            description="Mandatory for return requests."
          />

          <HighlightCard
            icon={<RefreshCcw className="h-5 w-5" />}
            title="Easy Refund Process"
            description="Approved refunds are processed after inspection."
          />

          <HighlightCard
            icon={<Truck className="h-5 w-5" />}
            title="Exchanges"
            description="Available for eligible products, subject to stock."
          />
        </div>
      </section>

      {/* Main content */}
      <section
        className="
          policy-content
          relative
          z-10
          mx-auto
          max-w-6xl
          px-4
          pb-8
          pt-10
          sm:px-6
          sm:pb-12
          sm:pt-12
          lg:px-8
        "
      >
        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Desktop contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0f1f3d]">
                On this page
              </p>

              <nav className="mt-4 space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-lg
                      px-3
                      py-2
                      text-sm
                      text-slate-600
                      transition
                      hover:bg-[#0f1f3d]/5
                      hover:text-[#0f1f3d]
                    "
                  >
                    <span>{section.title}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Policy */}
          <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
            <div className="prose prose-slate max-w-none">
              <section>
                <p className="text-base leading-7 text-slate-600">
                  At{" "}
                  <strong className="text-slate-900">
                    Vaishnavi Collections
                  </strong>
                  , we carefully check every order before it is packed and
                  shipped. We want you to receive your products in good
                  condition and have a smooth shopping experience.
                </p>

                <p className="mt-4 text-base leading-7 text-slate-600">
                  If you receive an item that is damaged, defective, incorrect,
                  or you need to request a return for an eligible product,
                  please read the policy below before contacting us.
                </p>
              </section>

              <PolicySection id="returns" title="1. Returns">
                <p>
                  Eligible products can be returned within{" "}
                  <strong>3 days of receiving your order</strong>.
                </p>

                <p>To be eligible for a return:</p>

                <BulletList
                  items={[
                    "The product must be unused and unworn.",
                    "It must be in its original condition and packaging.",
                    "All tags, accessories, parts, and other items supplied with the product should be returned.",
                    "The product should not have been washed, altered, damaged, or used.",
                    "An unboxing video is mandatory for return requests. The video should clearly show the package from the time it is opened and should capture the product and its condition.",
                  ]}
                />

                <Notice>
                  Returns that do not meet these conditions may not be accepted.
                </Notice>
              </PolicySection>

              <PolicySection
                id="damaged-defective"
                title="2. Damaged, Defective or Incorrect Products"
              >
                <p>
                  If your order arrives damaged, defective, or you receive a
                  product different from what you ordered, please contact
                  Vaishnavi Collections as soon as possible and preferably
                  within <strong>3 days of delivery</strong>.
                </p>

                <p>
                  Please keep the product, packaging, shipping label, and all
                  included items until your request has been reviewed.
                </p>

                <p>Depending on the situation, we may offer:</p>

                <BulletList
                  items={[
                    "A replacement, subject to availability.",
                    "A refund for the eligible product.",
                  ]}
                />

                <p>
                  For products damaged or incorrectly supplied due to our
                  error, we will guide you through the appropriate return or
                  replacement process.
                </p>
              </PolicySection>

              <PolicySection
                id="non-returnable"
                title="3. Products That Cannot Be Returned"
              >
                <p>
                  The following products are generally{" "}
                  <strong>non-returnable</strong>, unless they are received
                  damaged, defective, or are different from what you ordered:
                </p>

                <BulletList
                  items={[
                    "Customized or made-to-order Laddu Gopal Ji dresses and accessories.",
                    "Customized or made-to-order cushions and cushion covers.",
                    "Customized or made-to-order handmade hair accessories, including scrunchies, hair bows, and similar items.",
                    "Sale or clearance items.",
                  ]}
                />

                <p>
                  Made-to-order products are prepared specifically according
                  to the requirements of the customer. Because these products
                  are specially prepared for your order, they cannot normally
                  be returned due to a change of mind, personal preference,
                  colour preference, design preference, or similar reasons.
                </p>

                <p>
                  If a customized or made-to-order product is received{" "}
                  <strong>
                    damaged, defective, or incorrectly made compared with the
                    confirmed order details
                  </strong>
                  , please contact us within{" "}
                  <strong>3 days of delivery</strong> with the required
                  unboxing video and supporting photos/videos. We will review
                  the issue and guide you regarding the appropriate resolution.
                </p>
              </PolicySection>

              <PolicySection
                id="return-process"
                title="4. How to Request a Return"
              >
                <p>To request a return:</p>

                <ol className="space-y-3 pl-5">
                  <li>
                    Contact Vaishnavi Collections customer support through{" "}
                    <strong>WhatsApp</strong> within 3 days of receiving your
                    order.
                  </li>

                  <li>
                    Share your <strong>order number</strong> and details of the
                    product you want to return.
                  </li>

                  <li>
                    Provide clear photos/videos of the product and packaging
                    when requested.
                  </li>

                  <li>
                    Provide the required <strong>unboxing video</strong>.
                  </li>

                  <li>
                    Our team will review the request and confirm whether the
                    product is eligible for return.
                  </li>

                  <li>
                    Once the return is approved, we will provide the next steps
                    for sending the product back.
                  </li>
                </ol>

                <Notice>
                  Please do not send a product back without first contacting us
                  and receiving return instructions.
                </Notice>

                <p>
                  Once a return has been approved, the return shipment should
                  be arranged within <strong>7 days of return approval</strong>.
                </p>
              </PolicySection>

              <PolicySection id="refunds" title="5. Refunds">
                <p>
                  Once we receive the returned product, it will be inspected to
                  confirm that it meets our return conditions.
                </p>

                <p>
                  After the inspection is completed, we will notify you through
                  WhatsApp regarding the outcome of your return request.
                </p>

                <p>
                  For an approved refund, the refund amount will normally be
                  credited to your{" "}
                  <strong>Vaishnavi Collections Wallet</strong>.
                </p>

                <p>
                  If you prefer to receive the refund directly, you may provide
                  your <strong>UPI ID or payment QR code</strong>.
                </p>

                <p>
                  For an approved direct refund, we aim to process the refund
                  within{" "}
                  <strong>3 days of receiving the returned product</strong>,
                  subject to successful verification.
                </p>

                <p>
                  Please note that the time taken by your bank or UPI service
                  to reflect the amount may vary.
                </p>
              </PolicySection>

              <PolicySection
                id="partial-refunds"
                title="6. Partial Refunds"
              >
                <p>
                  A partial refund may be applicable if a returned product is
                  received:
                </p>

                <BulletList
                  items={[
                    "Damaged after delivery due to handling or use by the customer.",
                    "With missing parts, accessories, or components.",
                    "In a condition that is different from the condition in which it was originally sent.",
                  ]}
                />

                <p>
                  Partial refunds will be considered after inspection of the
                  returned product.
                </p>

                <p>
                  No deduction will be made for damage or missing items caused
                  by an error on our part.
                </p>
              </PolicySection>

              <PolicySection
                id="shipping-cod"
                title="7. Shipping and COD Charges"
              >
                <p>
                  <strong>
                    Shipping charges and Cash on Delivery (COD) charges are
                    generally non-refundable.
                  </strong>
                </p>

                <p>
                  However, if the return is due to a product being defective,
                  damaged upon arrival, or incorrectly supplied by Vaishnavi
                  Collections, the applicable charges may be handled
                  differently based on the circumstances.
                </p>

                <p>
                  For customer-initiated returns, applicable return shipping
                  costs may be deducted from the refundable amount.
                </p>
              </PolicySection>

              <PolicySection id="exchanges" title="8. Exchanges">
                <p>
                  If you would like to exchange an eligible product for a
                  different size or colour, please contact us within{" "}
                  <strong>3 days of receiving your order</strong>.
                </p>

                <p>Exchanges are subject to:</p>

                <BulletList
                  items={[
                    "Product eligibility.",
                    "Product condition.",
                    "Availability of the requested replacement.",
                    "Successful verification of the returned product.",
                  ]}
                />

                <p>
                  For customer-requested exchanges,{" "}
                  <strong>
                    return shipping and forward shipping charges will be borne
                    by the customer
                  </strong>
                  .
                </p>

                <p>
                  Customized or made-to-order products, including{" "}
                  <strong>
                    Laddu Gopal Ji dresses and accessories, cushions and
                    cushion covers, and handmade hair accessories such as
                    scrunchies and hair bows
                  </strong>
                  , are generally not eligible for exchange because they are
                  prepared specifically for the customer&apos;s requirements.
                </p>

                <p>
                  However, if a customized or made-to-order product is received
                  damaged, defective, or incorrectly made compared with the
                  confirmed order details, please contact us within{" "}
                  <strong>3 days of delivery</strong>. The issue will be
                  reviewed based on the circumstances and supporting evidence
                  provided.
                </p>
              </PolicySection>

              <PolicySection
                id="cancellation"
                title="9. Order Cancellation"
              >
                <p>
                  If you need to cancel an order, please do so as early as
                  possible.
                </p>

                <p>
                  Orders can be cancelled by the customer while they are still
                  in an eligible pre-processing stage. Once an order has
                  entered processing, been shipped, or otherwise moved beyond
                  the cancellation stage, cancellation may no longer be
                  possible.
                </p>

                <p>
                  For orders that have already been shipped, the applicable
                  return policy will apply.
                </p>

                <p>
                  If a payment has already been made, cancellation and refund
                  are treated as separate processes. A refund will be processed
                  only after the applicable refund conditions have been
                  verified.
                </p>
              </PolicySection>

              <PolicySection
                id="unboxing"
                title="10. Important Note About Unboxing Videos"
              >
                <p>
                  We strongly recommend recording a{" "}
                  <strong>continuous unboxing video</strong> from the moment
                  the package is received and before the package is opened.
                </p>

                <p>The video should clearly show:</p>

                <BulletList
                  items={[
                    "The shipping package.",
                    "The shipping label.",
                    "The condition of the package.",
                    "The opening of the package.",
                    "The product and its condition.",
                  ]}
                />

                <Notice>
                  An unboxing video is mandatory for return requests and may be
                  required when reviewing claims relating to missing, damaged,
                  defective, or incorrect products.
                </Notice>
              </PolicySection>

              <PolicySection
                id="declined"
                title="11. When a Return or Refund May Be Declined"
              >
                <p>A return or refund request may be declined if:</p>

                <BulletList
                  items={[
                    "The request is made after the applicable return period.",
                    "The product has been used, washed, altered, damaged, or worn.",
                    "The original packaging or required components are missing.",
                    "The product does not match the condition in which it was delivered.",
                    "The required unboxing video is not available.",
                    "The product belongs to a non-returnable category.",
                    "The issue is due to normal wear and tear or customer handling.",
                  ]}
                />

                <p>
                  Each return request is reviewed based on the product and
                  circumstances involved.
                </p>
              </PolicySection>

              <PolicySection id="help" title="12. Need Help?">
                <p>
                  If you need help with a return, refund, exchange, or damaged
                  order, please contact{" "}
                  <strong>
                    Vaishnavi Collections customer support through WhatsApp
                  </strong>{" "}
                  with your order number and relevant details.
                </p>

                <p>
                  We will review your request and guide you through the next
                  steps.
                </p>

                <div className="mt-6 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#0f1f3d]">
                      <MessageCircle className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        Need assistance?
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Keep your order number ready when contacting us so that
                        we can help you faster.
                      </p>
                    </div>
                  </div>
                </div>
              </PolicySection>
            </div>

            {/* Bottom navigation */}
            <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:border-[#0f1f3d]
                  hover:text-[#0f1f3d]
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Shopping
              </Link>

              <Link
                href="/policies/shipping"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#0f1f3d]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#172b52]
                "
              >
                Shipping Policy
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

function HighlightCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        policy-highlight-card
        min-h-[116px]
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-[0_8px_24px_rgba(15,31,61,0.10)]
        transition
        hover:-translate-y-0.5
        hover:shadow-[0_12px_30px_rgba(15,31,61,0.14)]
      "
    >
      <div className="flex items-start gap-3">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#0f1f3d]/5
            text-[#0f1f3d]
          "
        >
          {icon}
        </div>

        <div className="min-w-0 pt-0.5">
          <p className="text-sm font-bold leading-5 text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="
        scroll-mt-24
        border-t
        border-slate-200
        pt-8
        first:border-t-0
        first:pt-0
        sm:pt-10
      "
    >
      <h2 className="text-xl font-bold tracking-tight text-[#0f1f3d] sm:text-2xl">
        {title}
      </h2>

      <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-600">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 pl-1">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#D4AF37]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-4 py-3.5 text-sm leading-6 text-slate-700">
      {children}
    </div>
  );
}
