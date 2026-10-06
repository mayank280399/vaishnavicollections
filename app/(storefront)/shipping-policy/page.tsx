import type { Metadata } from "next";

export const revalidate = 86400;
import {
  MapPin,
  Package,
  Clock3,
  Truck,
  MapPinned,
  AlertTriangle,
  RefreshCcw,
  ShieldCheck,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Read the shipping and delivery policy for Vaishnavi Collections. We offer Pan-India shipping for eligible products.",
  alternates: { canonical: "/shipping-policy" },
};

const shippingSections = [
  {
    icon: MapPin,
    title: "1. Shipping Availability",
    content: (
      <>
        <p>
          We currently provide{" "}
          <strong className="font-semibold text-[#071A35]">
            Pan-India shipping
          </strong>{" "}
          for eligible products. Orders can be shipped to most serviceable
          locations across India. Delivery availability may depend on the
          courier service and PIN code provided at checkout.
        </p>
      </>
    ),
  },
  {
    icon: Package,
    title: "2. Order Processing Time",
    content: (
      <>
        <p>
          Orders are generally processed within{" "}
          <strong className="font-semibold text-[#071A35]">
            1–3 business days
          </strong>{" "}
          after payment confirmation.
        </p>

        <p className="mt-4">
          For{" "}
          <strong className="font-semibold text-[#071A35]">
            made-to-order or customized products
          </strong>
          , additional preparation time may be required. The estimated
          preparation time will be communicated when your order is confirmed.
        </p>

        <p className="mt-4">
          Orders containing both ready-to-ship and made-to-order products may
          be shipped together once all products are ready.
        </p>
      </>
    ),
  },
  {
    icon: Clock3,
    title: "3. Delivery Time",
    content: (
      <>
        <p>
          After dispatch, delivery generally takes approximately{" "}
          <strong className="font-semibold text-[#071A35]">
            3–7 business days
          </strong>
          , depending on your location and courier service.
        </p>

        <p className="mt-4">Delivery may take additional time because of:</p>

        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Courier delays</li>
          <li>Weather conditions</li>
          <li>Public holidays</li>
          <li>Festivals or peak shopping periods</li>
          <li>Incorrect or incomplete delivery information</li>
          <li>Remote or difficult-to-service locations</li>
          <li>Other circumstances beyond our control</li>
        </ul>
      </>
    ),
  },
  {
    icon: Truck,
    title: "4. Shipping Charges",
    content: (
      <>
        <p>
          Applicable shipping charges, if any, will be displayed during
          checkout or communicated to you before order confirmation.
        </p>

        <p className="mt-4">
          Shipping charges may vary depending on the order size, weight,
          destination, and delivery service.
        </p>

        <p className="mt-4">
          If free shipping is available for a particular product, order value,
          or promotional period, the applicable offer will be clearly mentioned
          on the website.
        </p>
      </>
    ),
  },
  {
    icon: MapPinned,
    title: "5. Order Tracking",
    content: (
      <p>
        Once your order has been dispatched, we may provide a tracking number
        or tracking information through the contact details provided with your
        order. You can use the tracking information to check the current status
        of your shipment.
      </p>
    ),
  },
  {
    icon: MapPin,
    title: "6. Delivery Address",
    content: (
      <>
        <p>
          Please make sure that your name, mobile number, address, city, state,
          and PIN code are entered correctly while placing your order.
        </p>

        <p className="mt-4">
          Vaishnavi Collections is not responsible for delivery delays or
          additional charges resulting from an incorrect or incomplete address
          provided by the customer.
        </p>

        <p className="mt-4">
          If you notice an incorrect address immediately after placing your
          order, please contact us as soon as possible. We will try to assist
          you, but changes cannot be guaranteed once the order has been
          dispatched.
        </p>
      </>
    ),
  },
  {
    icon: AlertTriangle,
    title: "7. Failed Delivery",
    content: (
      <>
        <p>
          If a courier attempts delivery and the package cannot be delivered
          because the recipient is unavailable, the address is incorrect, or
          delivery cannot otherwise be completed, the courier may make
          additional delivery attempts or return the package to us.
        </p>

        <p className="mt-4">
          If an order is returned because of an incorrect address, repeated
          failed delivery attempts, or refusal to accept the package, additional
          shipping charges may apply for reshipment.
        </p>
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "8. Damaged Packages",
    content: (
      <>
        <p>
          Please check the package at the time of delivery whenever possible.
        </p>

        <p className="mt-4">
          If the package appears severely damaged or tampered with, please
          contact us as soon as possible and provide photographs or videos of
          the package and the product received.
        </p>

        <p className="mt-4">
          For damaged or incorrect products, please refer to our{" "}
          <strong className="font-semibold text-[#071A35]">
            Return & Refund Policy
          </strong>{" "}
          for the applicable process and conditions.
        </p>
      </>
    ),
  },
  {
    icon: Truck,
    title: "9. Lost or Delayed Shipments",
    content: (
      <p>
        Once an order has been handed over to the courier, delivery is handled
        by the shipping provider. If your shipment appears to be significantly
        delayed or is reported as lost, please contact us with your order
        details. We will coordinate with the courier service and assist you
        with the available resolution.
      </p>
    ),
  },
  {
    icon: RefreshCcw,
    title: "10. Made-to-Order Products",
    content: (
      <p>
        Made-to-order products are prepared specifically according to the
        customer's requirements. Because these products require additional
        preparation time, their processing time may be longer than standard
        ready-to-ship products. The expected preparation and dispatch timeline
        will be communicated when your order is confirmed.
      </p>
    ),
  },
];

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#071A35]">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-sm font-medium text-[#D4AF37]">
              <Truck className="h-4 w-4" />
              Pan-India Shipping
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Shipping Policy
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              We carefully pack every order so your Vaishnavi Collections
              products reach you safely and in good condition.
            </p>

            <p className="mt-4 text-sm text-slate-400">
              Last updated: 1 October 2026
            </p>
          </div>
        </div>
      </section>

      {/* Quick Highlights */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px bg-slate-200 sm:grid-cols-3">
          <div className="bg-slate-50 px-6 py-7 text-center">
            <MapPin className="mx-auto h-6 w-6 text-[#D4AF37]" />

            <p className="mt-3 font-semibold text-[#071A35]">
              Pan-India Delivery
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Shipping across India
            </p>
          </div>

          <div className="bg-slate-50 px-6 py-7 text-center">
            <Package className="mx-auto h-6 w-6 text-[#D4AF37]" />

            <p className="mt-3 font-semibold text-[#071A35]">
              1–3 Business Days
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Typical order processing
            </p>
          </div>

          <div className="bg-slate-50 px-6 py-7 text-center">
            <Truck className="mx-auto h-6 w-6 text-[#D4AF37]" />

            <p className="mt-3 font-semibold text-[#071A35]">
              3–7 Business Days
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Typical delivery after dispatch
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="space-y-6">
          {shippingSections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                key={section.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#071A35] text-[#D4AF37]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-[#071A35] sm:text-xl">
                      {section.title}
                    </h2>

                    <div className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                      {section.content}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Contact */}
        <section className="mt-10 overflow-hidden rounded-2xl bg-[#071A35]">
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#D4AF37]" />

                <h2 className="text-xl font-bold text-white">
                  Need Help With Your Shipment?
                </h2>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                For questions regarding shipping, delivery, or your order,
                please contact Vaishnavi Collections. When contacting us about
                an existing order, please include your order number.
              </p>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="font-semibold text-white">
                  Vaishnavi Collections
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Gali No. 32, Indira Park,
                  <br />
                  Kailash Puri, Palam,
                  <br />
                  New Delhi, Delhi 110046, India
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Important Note */}
        <div className="mt-8 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#D4AF37]" />

            <div>
              <h3 className="font-semibold text-[#071A35]">
                Important Note
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Delivery timelines mentioned on this page are estimates and
                are not guaranteed delivery dates. Delays caused by courier
                partners, weather, holidays, festivals, or circumstances
                outside our reasonable control may occur.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
