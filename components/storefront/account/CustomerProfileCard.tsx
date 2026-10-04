"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Check,
  Loader2,
  Mail,
  Pencil,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Customer } from "@/app/(storefront)/account/page";


type Props = {
  customer: Customer;
  onUpdated: () => void;
};

export default function CustomerProfileCard({
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
    display_name: customer.display_name ?? "",
    phone: customer.phone ?? "",
    date_of_birth: customer.date_of_birth ?? "",
    gender: customer.gender ?? "",
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

  async function saveProfile() {
    try {
      setSaving(true);
      setMessage(null);

      const { error } = await supabase
        .from("customers")
        .update({
          display_name: form.display_name.trim() || null,
          phone: form.phone.trim() || null,
          date_of_birth:
            form.date_of_birth || null,
          gender: form.gender || null,
        })
        .eq("id", customer.id);

      if (error) {
        console.error(
          "CUSTOMER PROFILE UPDATE ERROR:",
          error
        );

        setMessage(
          "We couldn't save your details. Please try again."
        );

        return;
      }

      setEditing(false);
      setMessage("Your details have been updated.");
      onUpdated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      id="customer-profile"
      className="rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-[#071A35]">
            Personal details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Keep your information up to date.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-[#071A35]"
          >
            <Pencil size={15} />
            Edit
          </button>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Full name
              </label>

              <input
                value={form.display_name}
                onChange={(e) =>
                  updateField(
                    "display_name",
                    e.target.value
                  )
                }
                placeholder="Your name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Phone number
              </label>

              <input
                value={form.phone}
                onChange={(e) =>
                  updateField("phone", e.target.value)
                }
                placeholder="Your phone number"
                inputMode="tel"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Date of birth
              </label>

              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) =>
                  updateField(
                    "date_of_birth",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Gender
              </label>

              <select
                value={form.gender}
                onChange={(e) =>
                  updateField("gender", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#D4AF37]"
              >
                <option value="">Prefer not to say</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <button
                type="button"
                disabled={saving}
                onClick={saveProfile}
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
                Save changes
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setForm({
                    display_name:
                      customer.display_name ?? "",
                    phone: customer.phone ?? "",
                    date_of_birth:
                      customer.date_of_birth ?? "",
                    gender: customer.gender ?? "",
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
        ) : (
          <div className="space-y-4">
            <InfoRow
              icon={<UserRound size={17} />}
              label="Name"
              value={customer.display_name}
              empty="Not added yet"
            />

            <InfoRow
              icon={<Mail size={17} />}
              label="Email"
              value={customer.email}
              empty="Email not available"
            />

            <InfoRow
              icon={<Phone size={17} />}
              label="Phone"
              value={customer.phone}
              empty="Add your phone number"
            />

            <InfoRow
              icon={<CalendarDays size={17} />}
              label="Date of birth"
              value={customer.date_of_birth}
              empty="Not added"
            />
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

function InfoRow({
  icon,
  label,
  value,
  empty,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  empty: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#faf8ef] text-[#9b7b08]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p
          className={`mt-0.5 break-words text-sm font-medium ${
            value ? "text-[#071A35]" : "text-slate-400"
          }`}
        >
          {value || empty}
        </p>
      </div>
    </div>
  );
}