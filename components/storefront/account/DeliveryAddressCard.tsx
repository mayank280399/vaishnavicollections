"use client";

import React, { useState } from "react";
import {
  Check,
  Home,
  Loader2,
  MapPin,
  Pencil,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { Customer } from "@/app/account/page";

type Props = {
  customer: Customer;
  onUpdated: () => void;
};

export default function DeliveryAddressCard({
  customer,
  onUpdated,
}: Props) {
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(
    null
  );

  const [form, setForm] = useState({
    address_line1: customer.address_line1 ?? "",
    address_line2: customer.address_line2 ?? "",
    city: customer.city ?? "",
    state: customer.state ?? "",
    postal_code: customer.postal_code ?? "",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveAddress() {
    try {
      setSaving(true);
      setMessage(null);

      const { error } = await supabase
        .from("customers")
        .update({
          address_line1:
            form.address_line1.trim() || null,
          address_line2:
            form.address_line2.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          postal_code:
            form.postal_code.trim() || null,
        })
        .eq("id", customer.id);

      if (error) {
        console.error(
          "DELIVERY ADDRESS UPDATE ERROR:",
          error
        );

        setMessage(
          "We couldn't save your delivery address. Please try again."
        );

        return;
      }

      setEditing(false);
      setMessage("Delivery address updated.");
      onUpdated();
    } finally {
      setSaving(false);
    }
  }

  const hasAddress =
    customer.address_line1 ||
    customer.city ||
    customer.state ||
    customer.postal_code;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-[#071A35]">
            Delivery address
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            We’ll use this for your orders.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-[#071A35]"
          >
            <Pencil size={15} />
            {hasAddress ? "Edit" : "Add"}
          </button>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {editing ? (
          <div className="space-y-4">
            <AddressInput
              label="Address line 1"
              value={form.address_line1}
              onChange={(value) =>
                updateField("address_line1", value)
              }
              placeholder="House / Flat / Street"
            />

            <AddressInput
              label="Address line 2"
              value={form.address_line2}
              onChange={(value) =>
                updateField("address_line2", value)
              }
              placeholder="Area / Landmark (optional)"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <AddressInput
                label="City"
                value={form.city}
                onChange={(value) =>
                  updateField("city", value)
                }
                placeholder="City"
              />

              <AddressInput
                label="State"
                value={form.state}
                onChange={(value) =>
                  updateField("state", value)
                }
                placeholder="State"
              />
            </div>

            <AddressInput
              label="PIN code"
              value={form.postal_code}
              onChange={(value) =>
                updateField("postal_code", value)
              }
              placeholder="6-digit PIN code"
              inputMode="numeric"
            />

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <button
                type="button"
                disabled={saving}
                onClick={saveAddress}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A35] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Check size={16} />
                )}
                Save address
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setForm({
                    address_line1:
                      customer.address_line1 ?? "",
                    address_line2:
                      customer.address_line2 ?? "",
                    city: customer.city ?? "",
                    state: customer.state ?? "",
                    postal_code:
                      customer.postal_code ?? "",
                  });

                  setEditing(false);
                  setMessage(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#071A35]"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        ) : hasAddress ? (
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#faf8ef] text-[#9b7b08]">
              <MapPin size={20} />
            </div>

            <div className="text-sm leading-6 text-slate-600">
              <p className="font-semibold text-[#071A35]">
                {customer.address_line1}
              </p>

              {customer.address_line2 && (
                <p>{customer.address_line2}</p>
              )}

              <p>
                {[
                  customer.city,
                  customer.state,
                  customer.postal_code,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#faf8ef] p-5 text-center">
            <Home
              size={26}
              className="mx-auto text-[#9b7b08]"
            />

            <p className="mt-3 text-sm font-semibold text-[#071A35]">
              No delivery address yet
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Add your address now so checkout is quicker
              next time.
            </p>

            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-4 rounded-xl bg-[#071A35] px-4 py-2.5 text-xs font-semibold text-white"
            >
              Add address
            </button>
          </div>
        )}

        {message && (
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}

function AddressInput({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]"
      />
    </div>
  );
}