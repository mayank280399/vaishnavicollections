import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              ← Back to Vaishnavi Collections
            </Link>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
              Terms of Service
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Last updated: September 26, 2026
            </p>
          </div>

          <div className="space-y-8 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                1. Acceptance of Terms
              </h2>

              <p className="mt-3">
                By accessing or using the Vaishnavi Collections website or
                application, you agree to these Terms of Service. If you do
                not agree with these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                2. Our Services
              </h2>

              <p className="mt-3">
                Vaishnavi Collections provides products and related services
                through its physical store and online platform. Products may
                include home décor and furnishing products, cosmetics,
                artificial jewellery, Laddu Gopal dresses and accessories,
                handmade accessories, and other products offered by the
                business.
              </p>

              <p className="mt-3">
                Certain products may be prepared or customized on order.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                3. Accounts
              </h2>

              <p className="mt-3">
                Some features may require you to create an account. You are
                responsible for providing accurate information and for keeping
                your account credentials secure.
              </p>

              <p className="mt-3">
                You may sign in using supported authentication methods,
                including Google Sign-In where available.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                4. Products and Availability
              </h2>

              <p className="mt-3">
                Product descriptions, images, prices, availability, and other
                information may change from time to time. We make reasonable
                efforts to provide accurate information but cannot guarantee
                that every product detail will always be completely current.
              </p>

              <p className="mt-3">
                Product availability is subject to stock and, where
                applicable, the ability to prepare an item on order.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                5. Orders
              </h2>

              <p className="mt-3">
                An order or order request submitted through our platform may
                be subject to confirmation by Vaishnavi Collections.
                Availability, pricing, customization requirements, and other
                details may need to be confirmed before an order is accepted.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                6. Payments
              </h2>

              <p className="mt-3">
                Available payment methods may vary depending on the order and
                service. Any applicable payment requirements will be
                communicated during the ordering process.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                7. Custom and Made-to-Order Products
              </h2>

              <p className="mt-3">
                Products prepared or customized on order may have different
                preparation times and may be subject to specific order,
                cancellation, exchange, or return conditions. These conditions
                will be communicated where applicable before fulfillment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                8. User Conduct
              </h2>

              <p className="mt-3">
                You agree not to misuse the website or application, attempt
                unauthorized access, interfere with the operation of the
                service, or use the service for unlawful purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                9. Intellectual Property
              </h2>

              <p className="mt-3">
                Content provided by Vaishnavi Collections, including logos,
                branding, product images, text, graphics, and other materials,
                may be protected by applicable intellectual property laws.
                Such content may not be copied, reproduced, or commercially
                used without appropriate permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                10. Third-Party Services
              </h2>

              <p className="mt-3">
                Our platform may rely on third-party services for
                authentication, hosting, payments, communications, or other
                functionality. Your use of those services may also be subject
                to their respective terms and policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                11. Limitation of Liability
              </h2>

              <p className="mt-3">
                To the extent permitted by applicable law, Vaishnavi
                Collections will not be responsible for losses resulting from
                circumstances outside our reasonable control, including
                temporary service interruptions, third-party service failures,
                or events beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                12. Changes to These Terms
              </h2>

              <p className="mt-3">
                We may update these Terms of Service from time to time.
                Updated terms will be published on this page with a revised
                date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                13. Contact Us
              </h2>

              <p className="mt-3">
                If you have questions about these Terms of Service, please
                contact Vaishnavi Collections using the contact details
                provided on our website.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}