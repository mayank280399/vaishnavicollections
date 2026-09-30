"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useShopping } from "@/context/ShoppingContext";

import { createOrder } from "@/lib/checkout/actions";

import {
  CheckoutItem,
  CheckoutProduct,
  Customer,
  FormState,
  RecipientMode,
} from "@/lib/checkout/types";

import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import CheckoutDetailsStep from "@/components/checkout/CheckoutDetailsStep";
import CheckoutDeliveryStep from "@/components/checkout/CheckoutDeliveryStep";
import CheckoutPlaceOrderStep from "@/components/checkout/CheckoutPlaceOrderStep";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";

function getProductPrice(
  product: CheckoutProduct,
) {
  if (
    product.online_enabled &&
    product.online_price !== null &&
    Number(product.online_price) > 0
  ) {
    return Number(product.online_price);
  }

  return Number(product.selling_price);
}

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cartItems,
    loading: shoppingLoading,
  } = useShopping();

  const [items, setItems] = useState<
    CheckoutItem[]
  >([]);

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [recipientMode, setRecipientMode] =
    useState<RecipientMode>("me");

  const [
    saveCustomerDetails,
    setSaveCustomerDetails,
  ] = useState(false);

  /*
   * --------------------------------------------------
   * 1 = Details
   * 2 = Delivery
   * 3 = Place Order
   * --------------------------------------------------
   */
  const [currentStep, setCurrentStep] =  useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showOrderItems, setShowOrderItems] =
    useState(false);

  const [form, setForm] =
    useState<FormState>({
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
   * --------------------------------------------------
   * Load checkout data
   * --------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    async function loadCheckout() {
      if (shoppingLoading) {
        return;
      }

      const supabase = createClient();

      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(
          "/login?redirect=/checkout",
        );
        return;
      }

      try {
        /*
         * ------------------------------------------------
         * Customer
         * ------------------------------------------------
         */

        const {
          data: customerData,
          error: customerError,
        } = await supabase
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
            "Customer load error:",
            customerError,
          );
        }

        /*
         * ------------------------------------------------
         * Empty cart
         * ------------------------------------------------
         */

        if (!cartItems.length) {
          if (!cancelled) {
            setCustomer(
              customerData ?? null,
            );

            setItems([]);

            setLoading(false);
          }

          return;
        }

        const productIds =
          cartItems.map(
            (item) => item.product_id,
          );

        /*
         * ------------------------------------------------
         * Products
         * ------------------------------------------------
         */

        const {
          data: products,
          error: productsError,
        } = await supabase
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

        if (productsError) {
          throw productsError;
        }

        /*
         * ------------------------------------------------
         * Product images
         * ------------------------------------------------
         */

        const {
          data: images,
          error: imagesError,
        } = await supabase
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

        if (imagesError) {
          throw imagesError;
        }

        /*
         * ------------------------------------------------
         * Product map
         * ------------------------------------------------
         */

        const productMap = new Map<
          string,
          CheckoutProduct
        >(
          (products ?? []).map(
            (product) => [
              product.id,
              product as CheckoutProduct,
            ],
          ),
        );

        /*
         * ------------------------------------------------
         * Image map
         *
         * Because images are ordered by is_primary DESC,
         * the first image stored for each product becomes
         * the preferred image.
         * ------------------------------------------------
         */

        const imageMap = new Map<
          string,
          string
        >();

        for (const image of images ?? []) {
          if (
            !imageMap.has(
              image.product_id,
            )
          ) {
            imageMap.set(
              image.product_id,
              image.image_url,
            );
          }
        }

        /*
         * ------------------------------------------------
         * Build checkout items
         * ------------------------------------------------
         */

        const checkoutItems =
          cartItems
            .map((cartItem) => {
              const product =
                productMap.get(
                  cartItem.product_id,
                );

              if (!product) {
                return null;
              }

              return {
                id: cartItem.id,
                product_id:
                  cartItem.product_id,
                quantity: cartItem.quantity,
                product,
                image:
                  imageMap.get(
                    cartItem.product_id,
                  ) ?? null,
              };
            })
            .filter(
              Boolean,
            ) as CheckoutItem[];

        if (!cancelled) {
          setCustomer(
            customerData ?? null,
          );

          setItems(checkoutItems);

          /*
           * Prefill known customer information.
           */
          setForm((current) => ({
            ...current,

            customerName:
              customerData?.display_name ??
              user.user_metadata
                ?.display_name ??
              user.user_metadata
                ?.full_name ??
              current.customerName,

            customerPhone:
              customerData?.phone ??
              current.customerPhone,

            city:
              customerData?.city ??
              current.city,
          }));

          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Checkout loading error:",
          error,
        );

        if (!cancelled) {
          setError(
            "Unable to load checkout. Please try again.",
          );

          setLoading(false);
        }
      }
    }

    loadCheckout();

    return () => {
      cancelled = true;
    };
  }, [
    cartItems,
    shoppingLoading,
    router,
  ]);

  /*
   * --------------------------------------------------
   * Totals
   * --------------------------------------------------
   */

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => {
        const price =
          getProductPrice(
            item.product,
          );

        return (
          total +
          price * item.quantity
        );
      },
      0,
    );
  }, [items]);

  const shipping = 0;

  const total =
    subtotal + shipping;

  const totalQuantity = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );
  }, [items]);

  /*
   * --------------------------------------------------
   * LIVE FORM VALIDATION
   * --------------------------------------------------
   *
   * These values update automatically while the user
   * fills the form.
   */

  const detailsComplete = useMemo(() => {
    const name =
      form.customerName.trim();

    const phone =
      form.customerPhone.trim();

    return (
      name.length > 0 &&
      /^[6-9]\d{9}$/.test(phone)
    );
  }, [
    form.customerName,
    form.customerPhone,
  ]);

  const deliveryComplete = useMemo(() => {
    const address =
      form.addressLine1.trim();

    const city =
      form.city.trim();

    const state =
      form.state.trim();

    const postalCode =
      form.postalCode.trim();

    return (
      address.length > 0 &&
      city.length > 0 &&
      state.length > 0 &&
      /^\d{6}$/.test(postalCode)
    );
  }, [
    form.addressLine1,
    form.city,
    form.state,
    form.postalCode,
  ]);

  const checkoutComplete = useMemo(() => {
    return (
      items.length > 0 &&
      detailsComplete &&
      deliveryComplete
    );
  }, [
    items.length,
    detailsComplete,
    deliveryComplete,
  ]);

  /*
   * --------------------------------------------------
   * Form helpers
   * --------------------------------------------------
   */

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    /*
     * Clear old validation/server errors as the user
     * starts correcting the form.
     */
    setError("");
  }

  function handleRecipientModeChange(
    mode: RecipientMode,
  ) {
    setRecipientMode(mode);

    setError("");

    /*
     * If this is someone else's order, never allow
     * customer master details to be saved.
     */
    if (mode === "someone_else") {
      setSaveCustomerDetails(false);
    }

    /*
     * Switching back to "me" restores saved customer
     * information where available.
     */
    if (
      mode === "me" &&
      customer
    ) {
      setForm((current) => ({
        ...current,

        customerName:
          customer.display_name ||
          current.customerName,

        customerPhone:
          customer.phone ||
          current.customerPhone,

        city:
          customer.city ||
          current.city,
      }));
    }
  }

  /*
   * --------------------------------------------------
   * Validation
   * --------------------------------------------------
   */

  function validateDetails() {
    if (!form.customerName.trim()) {
      setError(
        recipientMode === "me"
          ? "Please enter your name."
          : "Please enter the recipient's name.",
      );

      return false;
    }

    const phone =
      form.customerPhone.trim();

    if (!phone) {
      setError(
        recipientMode === "me"
          ? "Please enter your phone number."
          : "Please enter the recipient's phone number.",
      );

      return false;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(
        "Please enter a valid 10-digit mobile number.",
      );

      return false;
    }

    return true;
  }

  function validateDelivery() {
    if (!form.addressLine1.trim()) {
      setError(
        "Please enter the delivery address.",
      );

      return false;
    }

    if (!form.city.trim()) {
      setError(
        "Please enter your city.",
      );

      return false;
    }

    if (!form.state.trim()) {
      setError(
        "Please enter your state.",
      );

      return false;
    }

    if (
      !form.postalCode.trim() ||
      !/^\d{6}$/.test(
        form.postalCode.trim(),
      )
    ) {
      setError(
        "Please enter a valid 6-digit PIN code.",
      );

      return false;
    }

    return true;
  }

  /*
   * --------------------------------------------------
   * Step navigation
   * --------------------------------------------------
   */

  function handleDetailsContinue() {
    setError("");

    /*
     * The button is already disabled when invalid,
     * but we still validate here for safety.
     */
    if (!detailsComplete) {
      validateDetails();
      return;
    }

    setCurrentStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleDeliveryContinue() {
    setError("");

    /*
     * The button is already disabled when invalid,
     * but validate again for safety.
     */
    if (!deliveryComplete) {
      validateDelivery();
      return;
    }

    setCurrentStep(3);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleBack() {
  setError("");

  setCurrentStep((step) => {
    if (step === 1) {
      return 1;
    }

    return (step - 1) as 1 | 2 | 3;
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

  /*
   * --------------------------------------------------
   * Submit
   * --------------------------------------------------
   */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    /*
     * Only Step 3 can submit the order.
     */
    if (currentStep !== 3) {
      return;
    }

    /*
     * Cart must contain items.
     */
    if (!items.length) {
      setError(
        "Your bag is empty.",
      );

      return;
    }

    /*
     * Validate Step 1 again.
     */
    if (!validateDetails()) {
      setCurrentStep(1);
      return;
    }

    /*
     * Validate Step 2 again.
     */
    if (!validateDelivery()) {
      setCurrentStep(2);
      return;
    }

    /*
     * Final safety check.
     */
    if (!checkoutComplete) {
      setError(
        "Please complete all required details before placing your order.",
      );

      return;
    }

    setSubmitting(true);

    try {
      const result =
        await createOrder({
          customerName:
            form.customerName.trim(),

          customerPhone:
            form.customerPhone.trim(),

          addressLine1:
            form.addressLine1.trim(),

          addressLine2:
            form.addressLine2.trim(),

          city:
            form.city.trim(),

          state:
            form.state.trim(),

          postalCode:
            form.postalCode.trim(),

          country: "India",

          notes:
            form.notes.trim(),

          paymentMethod: "CASH",

          saveCustomerDetails:
            recipientMode === "me" &&
            saveCustomerDetails,
        });

      if (!result.success) {
        setError(
          result.error ||
            "Unable to place your order.",
        );

        setSubmitting(false);

        return;
      }

      /*
       * Successful order.
       */
      router.replace(`/orders/${result.orderId}`,);
    } catch (error) {
      console.error(
        "Checkout submission error:",
        error,
      );

      setError(
        "Something went wrong while placing your order.",
      );

      setSubmitting(false);
    }
  }

  /*
   * --------------------------------------------------
   * Loading
   * --------------------------------------------------
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto flex max-w-5xl items-center justify-center py-24">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#b89445]" />

            Loading checkout...
          </div>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * Empty cart
   * --------------------------------------------------
   */

  if (!items.length) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">
              Your bag is empty
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Add something to your bag before
              checking out.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#0f1f3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172b52]"
            >
              <ArrowLeft className="h-4 w-4" />

              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * Main checkout
   * --------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="rounded-[2rem] bg-[#0f1f3d] px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">
          <div className="mb-6">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-xs font-medium text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to Bag
            </Link>

            <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
              Almost there! ✨
            </h1>

            <p className="mt-2 text-sm text-white/60">
              Complete your details and place your
              order securely.
            </p>
          </div>

          <CheckoutProgress currentStep={currentStep} />
        </div>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Left */}
          <div>
            {/* ---------------------------------------- */}
            {/* STEP 1 */}
            {/* ---------------------------------------- */}

            {currentStep === 1 && (
              <CheckoutDetailsStep
                form={form}
                customer={customer}
                recipientMode={
                  recipientMode
                }
                saveCustomerDetails={
                  saveCustomerDetails
                }
                error={error}
                canContinue={
                  detailsComplete
                }
                onFieldChange={
                  updateField
                }
                onRecipientModeChange={
                  handleRecipientModeChange
                }
                onSaveCustomerDetailsChange={
                  setSaveCustomerDetails
                }
                onContinue={
                  handleDetailsContinue
                }
              />
            )}

            {/* ---------------------------------------- */}
            {/* STEP 2 */}
            {/* ---------------------------------------- */}

            {currentStep === 2 && (
              <CheckoutDeliveryStep
                form={form}
                error={error}
                canContinue={
                  deliveryComplete
                }
                onFieldChange={
                  updateField
                }
                onBack={handleBack}
                onContinue={
                  handleDeliveryContinue
                }
              />
            )}

            {/* ---------------------------------------- */}
            {/* STEP 3 */}
            {/* ---------------------------------------- */}

            {currentStep === 3 && (
              <CheckoutPlaceOrderStep
                form={form}
                error={error}
                submitting={
                  submitting
                }
                onFieldChange={
                  updateField
                }
                onBack={handleBack}
              />
            )}
          </div>

          {/* Right / Order Summary */}
          <CheckoutOrderSummary
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            totalQuantity={
              totalQuantity
            }
            currentStep={
              currentStep
            }
            submitting={
              submitting
            }
            showOrderItems={
              showOrderItems
            }
            checkoutComplete={
              checkoutComplete
            }
            onToggleItems={() =>
              setShowOrderItems(
                (value) => !value,
              )
            }
            onSubmit={
              handleSubmit
            }
          />
        </div>
      </div>
    </main>
  );
}