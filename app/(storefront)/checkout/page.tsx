"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useShopping } from "@/context/ShoppingContext";
import { createOrder } from "./actions";

type CheckoutProduct = {
  id: string;
  name: string;
  product_title: string | null;
  sku: string | null;
  selling_price: number;
  online_price: number | null;
  online_enabled: boolean;
  visibility: string;
};

type CheckoutItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: CheckoutProduct;
  image: string | null;
};

type Customer = {
  display_name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
};

type FormState = {
  customerName: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
};

function getProductPrice(product: CheckoutProduct) {
  if (
    product.online_enabled &&
    product.online_price !== null &&
    Number(product.online_price) > 0
  ) {
    return Number(product.online_price);
  }

  return Number(product.selling_price);
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cartItems,
    loading: shoppingLoading,
  } = useShopping();

  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    notes: "",
  });

  /*
   * Load the real cart products and customer.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadCheckoutData() {
      setLoading(true);
      setError("");

      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace(
            `/login?redirect=/checkout`,
          );
          return;
        }

        /*
         * Load customer information.
         *
         * customers.profile_id is linked to the
         * authenticated user's profile.
         */
        const { data: customerData, error: customerError } =
          await supabase
            .from("customers")
            .select(
              `
                display_name,
                phone,
                email,
                city
              `,
            )
            .eq("profile_id", user.id)
            .maybeSingle();

        if (customerError) {
          console.error(
            "Customer loading error:",
            customerError,
          );
        }

        /*
         * Build product IDs from the real cart.
         */
        if (cartItems.length === 0) {
          if (!cancelled) {
            setItems([]);
            setCustomer(customerData ?? null);
            setLoading(false);
          }

          return;
        }

        const productIds = cartItems.map(
          (item) => item.product_id,
        );

        /*
         * Load current product data.
         */
        const { data: productData, error: productError } =
          await supabase
            .from("products")
            .select(
              `
                id,
                name,
                product_title,
                sku,
                selling_price,
                online_price,
                online_enabled,
                visibility
              `,
            )
            .in("id", productIds);

        if (productError) {
          throw productError;
        }

        /*
         * Load product images.
         */
        const { data: imageData, error: imageError } =
          await supabase
            .from("product_images")
            .select(
              `
                product_id,
                image_url,
                is_primary
              `,
            )
            .in("product_id", productIds)
            .order("is_primary", {
              ascending: false,
            });

        if (imageError) {
          throw imageError;
        }

        const products =
          (productData ?? []) as CheckoutProduct[];

        const images = imageData ?? [];

        const checkoutItems: CheckoutItem[] = [];

        for (const cartItem of cartItems) {
          const product = products.find(
            (item) => item.id === cartItem.product_id,
          );

          if (!product) continue;

          const image =
            images.find(
              (item) =>
                item.product_id === product.id &&
                item.is_primary,
            )?.image_url ??
            images.find(
              (item) =>
                item.product_id === product.id,
            )?.image_url ??
            null;

          checkoutItems.push({
            id: cartItem.id,
            product_id: cartItem.product_id,
            quantity: cartItem.quantity,
            product,
            image,
          });
        }

        if (!cancelled) {
          setCustomer(customerData ?? null);
          setItems(checkoutItems);

          setForm((current) => ({
            ...current,
            customerName:
              customerData?.display_name ??
              user.user_metadata?.display_name ??
              user.user_metadata?.full_name ??
              "",
            customerPhone:
              customerData?.phone ?? "",
            city:
              customerData?.city ?? "",
          }));

          setLoading(false);
        }
      } catch (err) {
        console.error(
          "Checkout loading error:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load checkout information. Please try again.",
          );
          setLoading(false);
        }
      }
    }

    if (!shoppingLoading) {
      loadCheckoutData();
    }

    return () => {
      cancelled = true;
    };
  }, [cartItems, shoppingLoading, router]);

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = getProductPrice(item.product);

      return total + price * item.quantity;
    }, 0);
  }, [items]);

  const shipping = 0;

  const total = subtotal + shipping;

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!form.customerName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.customerPhone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!form.addressLine1.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!form.state.trim()) {
      setError("Please enter your state.");
      return;
    }

    if (!form.postalCode.trim()) {
      setError("Please enter your PIN code.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await createOrder({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: "India",
        notes: form.notes,
        paymentMethod: "CASH",
      });

      if (!result.success) {
        setError(
          result.error ||
            "Unable to place your order.",
        );
        setSubmitting(false);
        return;
      }

      router.replace(
        `/orders/${result.orderId}`,
      );
    } catch (err) {
      console.error(
        "Checkout submission error:",
        err,
      );

      setError(
        "Something went wrong while placing your order.",
      );

      setSubmitting(false);
    }
  }

  /*
   * Loading
   */
  if (loading || shoppingLoading) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-[#b89445]" />
            Loading checkout...
          </div>
        </div>
      </main>
    );
  }

  /*
   * Empty cart
   */
  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-16">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <ShoppingBag className="h-7 w-7 text-slate-500" />
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">
              Your bag is empty
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add some products to your bag before
              continuing to checkout.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#0f1f3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#172b52]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Header */}
        <div className="mb-7">
          <Link
            href="/cart"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0f1f3d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bag
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b89445]">
              Vaishnavi Collections
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0f1f3d] sm:text-4xl">
              Checkout
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Enter your delivery details to place your order.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"
        >
          {/* LEFT */}
          <div className="space-y-6">
            {/* Contact */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f1f3d] text-white">
                  <User className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Contact Information
                  </h2>
                  <p className="text-xs text-slate-500">
                    We'll use this information for your order.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  required
                  value={form.customerName}
                  onChange={(value) =>
                    updateField(
                      "customerName",
                      value,
                    )
                  }
                  placeholder="Your full name"
                />

                <Field
                  label="Phone Number"
                  required
                  type="tel"
                  value={form.customerPhone}
                  onChange={(value) =>
                    updateField(
                      "customerPhone",
                      value,
                    )
                  }
                  placeholder="10-digit mobile number"
                />
              </div>
            </section>

            {/* Address */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f1f3d] text-white">
                  <MapPin className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Delivery Address
                  </h2>
                  <p className="text-xs text-slate-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <Field
                  label="Address"
                  required
                  value={form.addressLine1}
                  onChange={(value) =>
                    updateField(
                      "addressLine1",
                      value,
                    )
                  }
                  placeholder="House / Flat / Street / Area"
                />

                <Field
                  label="Address Line 2"
                  value={form.addressLine2}
                  onChange={(value) =>
                    updateField(
                      "addressLine2",
                      value,
                    )
                  }
                  placeholder="Landmark, apartment, etc. (optional)"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="City"
                    required
                    value={form.city}
                    onChange={(value) =>
                      updateField(
                        "city",
                        value,
                      )
                    }
                    placeholder="City"
                  />

                  <Field
                    label="State"
                    required
                    value={form.state}
                    onChange={(value) =>
                      updateField(
                        "state",
                        value,
                      )
                    }
                    placeholder="State"
                  />
                </div>

                <Field
                  label="PIN Code"
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.postalCode}
                  onChange={(value) =>
                    updateField(
                      "postalCode",
                      value.replace(/\D/g, ""),
                    )
                  }
                  placeholder="6-digit PIN code"
                />
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f1f3d] text-white">
                  <Phone className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Payment Method
                  </h2>
                  <p className="text-xs text-slate-500">
                    Payment integration can be added later.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#b89445] bg-[#b89445]/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0f1f3d]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Cash on Delivery
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Pay when your order is delivered.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="font-semibold text-slate-900">
                Order Notes
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Optional instructions for your order.
              </p>

              <textarea
                value={form.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="Any special delivery instructions?"
                className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#b89445] focus:bg-white focus:ring-2 focus:ring-[#b89445]/10"
              />
            </section>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* RIGHT / SUMMARY */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h2 className="font-semibold text-[#0f1f3d]">
                  Order Summary
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {items.length}{" "}
                  {items.length === 1
                    ? "product"
                    : "products"}{" "}
                  in your bag
                </p>
              </div>

              <div className="max-h-[420px] space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
                {items.map((item) => {
                  const price = getProductPrice(
                    item.product,
                  );

                  const itemTotal =
                    price * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={
                              item.product
                                .product_title ||
                              item.product.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-slate-300" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-slate-900">
                          {item.product.product_title ||
                            item.product.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Qty: {item.quantity}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatPrice(price)} each
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-slate-900">
                        {formatPrice(itemTotal)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 px-5 py-5 sm:px-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="font-medium text-emerald-600">
                      Free
                    </span>
                  </div>

                  <div className="my-4 border-t border-dashed border-slate-200" />

                  <div className="flex items-end justify-between">
                    <span className="font-semibold text-slate-900">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-[#0f1f3d]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f1f3d] px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172b52] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                  By placing this order, you confirm that
                  your delivery information is correct.
                </p>
              </div>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  maxLength,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?:
    | "text"
    | "search"
    | "email"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        required={required}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#b89445] focus:bg-white focus:ring-2 focus:ring-[#b89445]/10"
      />
    </label>
  );
}