"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Supabase submission will be added here.
    setSubmitted(true);
  }

  return (
    <section className="bg-[#F8F6F1] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
            Send An Enquiry
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight text-[#0B1F3A] sm:text-5xl">
            Tell us what you&apos;re looking for.
          </h2>

          <p className="mt-5 text-sm leading-7 text-[#0B1F3A]/60 sm:text-base">
            Have a question about a product, want to place an order,
            or need something prepared on order? Send us a message and
            we&apos;ll get back to you.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#0B1F3A]/10 bg-white p-6 shadow-sm sm:p-8">
          {submitted ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0B1F3A] text-[#C9A227]">
                <Send size={22} />
              </div>

              <h3 className="mt-6 font-serif text-2xl text-[#0B1F3A]">
                Thank you for reaching out.
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-[#0B1F3A]/55">
                Your enquiry has been received. We&apos;ll get back to
                you as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Name"
                  name="name"
                  placeholder="Your name"
                  required
                />

                <Field
                  label="Phone Number"
                  name="phone"
                  placeholder="Your phone number"
                  required
                />
              </div>

              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="Your email address"
              />

              <div>
                <label
                  htmlFor="enquiry"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F3A]/70"
                >
                  What can we help with?
                </label>

                <select
                  id="enquiry"
                  name="enquiry"
                  className="mt-2 w-full rounded-xl border border-[#0B1F3A]/10 bg-[#F8F6F1] px-4 py-3 text-sm text-[#0B1F3A] outline-none focus:border-[#C9A227]"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option value="product">
                    Product Enquiry
                  </option>
                  <option value="order">
                    Order Enquiry
                  </option>
                  <option value="laddu-gopal">
                    Laddu Gopal Poshak
                  </option>
                  <option value="made-to-order">
                    Made-to-Order Requirement
                  </option>
                  <option value="home-decor">
                    Home Decor
                  </option>
                  <option value="home-furnishing">
                    Home Furnishing
                  </option>
                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F3A]/70"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Tell us what you need..."
                  className="mt-2 w-full resize-none rounded-xl border border-[#0B1F3A]/10 bg-[#F8F6F1] px-4 py-3 text-sm text-[#0B1F3A] outline-none placeholder:text-[#0B1F3A]/35 focus:border-[#C9A227]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#132B4D]"
              >
                Send Enquiry
                <Send size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B1F3A]/70"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[#0B1F3A]/10 bg-[#F8F6F1] px-4 py-3 text-sm text-[#0B1F3A] outline-none placeholder:text-[#0B1F3A]/35 focus:border-[#C9A227]"
      />
    </div>
  );
}