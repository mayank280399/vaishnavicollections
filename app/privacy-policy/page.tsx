import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <><Navbar />
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
                                Privacy Policy
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Last updated: September 26, 2026
                            </p>
                        </div>

                        <div className="space-y-8 text-sm leading-7 text-slate-600">
                            <section>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    1. Introduction
                                </h2>

                                <p className="mt-3">
                                    Vaishnavi Collections respects your privacy and is committed
                                    to protecting your personal information. This Privacy Policy
                                    explains how we collect, use, store, and protect information
                                    when you use our website, application, and related services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    2. Information We Collect
                                </h2>

                                <p className="mt-3">
                                    Depending on how you use our services, we may collect
                                    information such as:
                                </p>

                                <ul className="mt-3 list-disc space-y-2 pl-6">
                                    <li>Your name and email address.</li>
                                    <li>
                                        Information provided when you create or update your account.
                                    </li>
                                    <li>
                                        Information associated with your Google account when you
                                        choose to sign in using Google.
                                    </li>
                                    <li>Order and purchase information.</li>
                                    <li>
                                        Contact information that you voluntarily provide to us.
                                    </li>
                                    <li>
                                        Information required to provide customer support and
                                        manage your account.
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    3. Google Sign-In
                                </h2>

                                <p className="mt-3">
                                    If you choose to sign in using Google, authentication is
                                    handled through Google and our authentication service provider.
                                    We may receive basic account information such as your name,
                                    email address, and profile information made available by
                                    Google through the permissions you grant.
                                </p>

                                <p className="mt-3">
                                    We use this information to create and manage your account,
                                    provide access to our services, and associate your account
                                    with your orders and other activities on our platform.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    4. How We Use Your Information
                                </h2>

                                <p className="mt-3">
                                    We may use collected information to:
                                </p>

                                <ul className="mt-3 list-disc space-y-2 pl-6">
                                    <li>Create and manage your account.</li>
                                    <li>Process and manage orders.</li>
                                    <li>Provide customer support.</li>
                                    <li>Improve our website and services.</li>
                                    <li>Maintain account and transaction records.</li>
                                    <li>Protect our services against unauthorized activity.</li>
                                    <li>
                                        Communicate with you about your account, orders, or services.
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    5. Information Sharing
                                </h2>

                                <p className="mt-3">
                                    We do not sell your personal information. We may share
                                    information with service providers when necessary to operate
                                    our website, authentication, hosting, payment, or other
                                    business services.
                                </p>

                                <p className="mt-3">
                                    We may also disclose information when required by applicable
                                    law or when reasonably necessary to protect our rights,
                                    customers, or services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    6. Data Security
                                </h2>

                                <p className="mt-3">
                                    We take reasonable measures to protect personal information
                                    from unauthorized access, alteration, disclosure, or
                                    destruction. However, no method of transmission or electronic
                                    storage can be guaranteed to be completely secure.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    7. Cookies and Similar Technologies
                                </h2>

                                <p className="mt-3">
                                    Our website may use cookies or similar technologies to
                                    maintain authentication sessions, remember preferences, and
                                    provide essential functionality.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    8. Your Choices
                                </h2>

                                <p className="mt-3">
                                    You may choose not to provide certain information, although
                                    this may prevent you from using some features of our services.
                                    You may also request information about or deletion of your
                                    personal information, subject to applicable legal and
                                    operational requirements.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    9. Third-Party Services
                                </h2>

                                <p className="mt-3">
                                    Our services may use third-party providers, including
                                    authentication, hosting, analytics, payment, or other service
                                    providers. Their handling of information may also be governed
                                    by their respective privacy policies.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    10. Changes to This Policy
                                </h2>

                                <p className="mt-3">
                                    We may update this Privacy Policy from time to time. Any
                                    changes will be posted on this page with an updated revision
                                    date.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    11. Contact Us
                                </h2>

                                <p className="mt-3">
                                    If you have questions about this Privacy Policy or how your
                                    information is handled, please contact Vaishnavi Collections
                                    through the contact details provided on our website.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            <Footer /></>
    );
}