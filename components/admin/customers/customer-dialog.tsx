"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Customer = {
  id: string;
  profile_id: string | null;
  customer_code: string;
  display_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;

  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;

  source: string | null;
  first_purchase_at: string | null;
  last_purchase_at: string | null;
  total_orders: number | null;
  total_spent: number | string | null;
  lifetime_profit: number | string | null;
  customer_segment: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerDialogProps = {
  showTrigger?: boolean;
  editCustomer?: Customer | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: () => void | Promise<void>;
};

const SOURCES = [
  { value: "PHYSICAL_SHOP", label: "Physical Shop" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "REFERRAL", label: "Referral" },
  { value: "ONLINE", label: "Online" },
  { value: "OTHER", label: "Other" },
] as const;

const GENDERS = [
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "OTHER", label: "Other" },
] as const;

const inputClass =
  "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required ? (
          <span className="ml-1 text-destructive">*</span>
        ) : null}
      </Label>

      {children}
    </div>
  );
}

function generateCustomerCode(): string {
  const timestamp = Date.now().toString().slice(-8);
  return `CUST-${timestamp}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CustomerDialog({
  showTrigger = false,
  editCustomer = null,
  open: controlledOpen,
  onOpenChange,
  onSaved,
}: CustomerDialogProps) {
  const supabase = useMemo(() => createClient(), []);

  const isEditMode = Boolean(editCustomer);
  const isControlled = controlledOpen !== undefined;

  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;

  const [customerCode, setCustomerCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [source, setSource] = useState("PHYSICAL_SHOP");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function resetForm(): void {
    setCustomerCode(
      editCustomer?.customer_code ?? generateCustomerCode()
    );
    setDisplayName(editCustomer?.display_name ?? "");
    setPhone(editCustomer?.phone ?? "");
    setEmail(editCustomer?.email ?? "");
    setDateOfBirth(editCustomer?.date_of_birth ?? "");
    setGender(editCustomer?.gender ?? "");

    setAddressLine1(editCustomer?.address_line1 ?? "");
    setAddressLine2(editCustomer?.address_line2 ?? "");
    setCity(editCustomer?.city ?? "");
    setState(editCustomer?.state ?? "");
    setPostalCode(editCustomer?.postal_code ?? "");

    setSource(editCustomer?.source ?? "PHYSICAL_SHOP");

    setError("");
    setMessage("");
  }

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, editCustomer]);

  function handleOpenChange(value: boolean): void {
    if (!isControlled) {
      setInternalOpen(value);
    }

    onOpenChange?.(value);

    if (!value) {
      setError("");
      setMessage("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setMessage("");

    const name = displayName.trim();
    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim();
    const normalizedAddressLine1 = addressLine1.trim();
    const normalizedAddressLine2 = addressLine2.trim();
    const normalizedCity = city.trim();
    const normalizedState = state.trim();
    const normalizedPostalCode = postalCode.trim();

    if (!name) {
      setError("Customer name is required.");
      return;
    }

    if (
      normalizedPhone &&
      !/^\d{10}$/.test(normalizedPhone)
    ) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (
      normalizedEmail &&
      !/^\S+@\S+\.\S+$/.test(normalizedEmail)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!normalizedAddressLine1) {
      setError("Address Line 1 is required.");
      return;
    }

    if (!normalizedCity) {
      setError("City is required.");
      return;
    }

    if (!normalizedState) {
      setError("State is required.");
      return;
    }

    if (!/^\d{6}$/.test(normalizedPostalCode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        customer_code:
          customerCode.trim() || generateCustomerCode(),
        display_name: name,
        phone: normalizedPhone || null,
        email: normalizedEmail || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,

        address_line1: normalizedAddressLine1,
        address_line2: normalizedAddressLine2 || null,
        city: normalizedCity,
        state: normalizedState,
        postal_code: normalizedPostalCode,

        source: source || "OTHER",
      };

      if (editCustomer) {
        const { data, error: updateError } = await supabase
          .from("customers")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editCustomer.id)
          .select(
            `
              id,
              customer_code,
              display_name,
              phone,
              email,
              date_of_birth,
              gender,
              address_line1,
              address_line2,
              city,
              state,
              postal_code,
              source
            `
          );

        if (updateError) {
          throw new Error(updateError.message);
        }

        if (!data || data.length === 0) {
          throw new Error(
            "Customer was not updated. Please check your Supabase UPDATE policy."
          );
        }

        setMessage("Customer updated successfully.");
      } else {
        const { data, error: insertError } = await supabase
          .from("customers")
          .insert({
            ...payload,
            total_orders: 0,
            total_spent: 0,
            lifetime_profit: 0,
            customer_segment: "NEW",
          })
          .select(
            `
              id,
              customer_code,
              display_name,
              phone,
              email,
              date_of_birth,
              gender,
              address_line1,
              address_line2,
              city,
              state,
              postal_code,
              source
            `
          );

        if (insertError) {
          throw new Error(insertError.message);
        }

        if (!data || data.length === 0) {
          throw new Error(
            "Customer was not created. Please check your Supabase INSERT policy."
          );
        }

        setMessage("Customer created successfully.");
      }

      await onSaved?.();

      window.setTimeout(() => {
        handleOpenChange(false);
      }, 500);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save customer."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger ? (
        <DialogTrigger>
          <Button className="h-10 rounded-xl px-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent
        className="
          !w-[calc(100vw-1rem)]
          !max-w-2xl
          max-h-[95vh]
          overflow-x-hidden
          overflow-y-auto
          rounded-2xl
          bg-white
          p-0
        "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" />
            </div>

            <span>
              {isEditMode ? "Edit Customer" : "Add Customer"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          {/* Personal Information */}
          <section className="rounded-2xl border bg-card p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">
                Customer Information
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Basic information used for customer records,
                orders and communication.
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
              <Field label="Customer Code" required>
                <input
                  value={customerCode}
                  onChange={(event) =>
                    setCustomerCode(event.target.value)
                  }
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Customer Name" required>
                <input
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(event.target.value)
                  }
                  placeholder="e.g. Priya Sharma"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Phone">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    inputMode="numeric"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    placeholder="9876543210"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </Field>

              <Field label="Email">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="customer@example.com"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </Field>

              <Field label="Date of Birth">
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(event) =>
                      setDateOfBirth(event.target.value)
                    }
                    max={today()}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </Field>

              <Field label="Gender">
                <select
                  value={gender}
                  onChange={(event) =>
                    setGender(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Select gender</option>

                  {GENDERS.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* Delivery Address */}
          <section className="rounded-2xl border bg-card p-4 sm:p-5">
            <div className="mb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Delivery Address
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Keep the customer&apos;s saved address
                    ready for future online orders.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Field label="Address Line 1" required>
                <input
                  value={addressLine1}
                  onChange={(event) =>
                    setAddressLine1(event.target.value)
                  }
                  placeholder="House / Flat / Shop / Street"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Address Line 2">
                <input
                  value={addressLine2}
                  onChange={(event) =>
                    setAddressLine2(event.target.value)
                  }
                  placeholder="Landmark, locality, apartment, etc. (optional)"
                  className={inputClass}
                />
              </Field>

              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
                <Field label="City" required>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      value={city}
                      onChange={(event) =>
                        setCity(event.target.value)
                      }
                      placeholder="Delhi"
                      className={`${inputClass} pl-10`}
                      required
                    />
                  </div>
                </Field>

                <Field label="State" required>
                  <input
                    value={state}
                    onChange={(event) =>
                      setState(event.target.value)
                    }
                    placeholder="Delhi"
                    className={inputClass}
                    required
                  />
                </Field>

                <Field label="PIN Code" required>
                  <input
                    inputMode="numeric"
                    value={postalCode}
                    onChange={(event) =>
                      setPostalCode(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    placeholder="110046"
                    className={inputClass}
                    maxLength={6}
                    required
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Customer Source */}
          <section className="rounded-2xl border bg-card p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">
                Customer Source
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Helps you understand where the customer came
                from.
              </p>
            </div>

            <Field label="Customer Source">
              <select
                value={source}
                onChange={(event) =>
                  setSource(event.target.value)
                }
                className={inputClass}
              >
                {SOURCES.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
          </section>

          {/* Messages */}
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          ) : null}

          {message ? (
            <div
              role="status"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700"
            >
              {message}
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="h-11 rounded-xl"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {isEditMode
                    ? "Update Customer"
                    : "Save Customer"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}