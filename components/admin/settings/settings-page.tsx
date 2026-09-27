"use client";

import { useState } from "react";
import { updateAppSettings } from "@/lib/settings/actions";
import { AppSettings, AppSettingsUpdate } from "@/lib/settings/settings-types";


type Section =
  | "general"
  | "business"
  | "online"
  | "social"
  | "hours"
  | "inventory"
  | "orders"
  | "tax"
  | "communication"
  | "notifications";

type Props = {
  initialSettings: AppSettings;
};

const sections: {
  id: Section;
  label: string;
  description: string;
}[] = [
  {
    id: "general",
    label: "General",
    description: "Application preferences",
  },
  {
    id: "business",
    label: "Business Information",
    description: "Shop details and address",
  },
  {
    id: "online",
    label: "Online Store",
    description: "Website and online orders",
  },
  {
    id: "social",
    label: "Social & Reviews",
    description: "Instagram, Google and social links",
  },
  {
    id: "hours",
    label: "Business Hours",
    description: "Opening and closing hours",
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Stock and alerts",
  },
  {
    id: "orders",
    label: "Orders & Sales",
    description: "Orders, shipping and invoices",
  },
  {
    id: "tax",
    label: "Tax",
    description: "Tax and GST settings",
  },
  {
    id: "communication",
    label: "Communication",
    description: "Customer messages",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts and notification email",
  },
];

function normalizeSettings(settings: AppSettings): AppSettingsUpdate {
  const {
    id,
    created_at,
    updated_at,
    ...rest
  } = settings;

  return rest;
}

export function SettingsPage({ initialSettings }: Props) {
  const [settings, setSettings] = useState<AppSettings>(
    initialSettings
  );

  const [activeSection, setActiveSection] =
    useState<Section>("general");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const result = await updateAppSettings(
      normalizeSettings(settings)
    );

    if (!result.success) {
      setError(result.error || "Failed to save settings.");
      setSaving(false);
      return;
    }

    if (result.data) {
      setSettings(result.data as AppSettings);
    }

    setSaved(true);
    setSaving(false);
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your Vaishnavi Collections application and
                business configuration.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-900 px-5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {(saved || error) && (
            <div className="mt-4">
              {saved && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  Settings saved successfully.
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="hidden border-b border-gray-200 px-4 py-3 lg:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Settings
              </p>
            </div>

            <nav className="flex gap-1 overflow-x-auto p-2 lg:block lg:space-y-1 lg:overflow-visible">
              {sections.map((section) => {
                const active = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`min-w-max rounded-lg px-3 py-2.5 text-left transition lg:flex lg:w-full lg:items-center ${
                      active
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {section.label}
                      </div>

                      <div className="mt-0.5 hidden text-xs text-gray-400 lg:block">
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="p-5 sm:p-6">
              {activeSection === "general" && (
                <GeneralSection
                  settings={settings}
                  update={update}
                />
              )}

              {activeSection === "business" && (
                <BusinessSection
                  settings={settings}
                  update={update}
                />
              )}

              {activeSection === "online" && (
                <OnlineSection
                  settings={settings}
                  update={update}
                />
              )}

              {activeSection === "social" && (
                <SocialSection
                  settings={settings}
                  update={update}
                />
              )}

              {activeSection === "hours" && (
                <HoursSection
                  settings={settings}
                  update={update}
                />
              )}

              {activeSection === "inventory" && (
                <InventorySection
                  settings={settings}
                  update={update}
                />
              )}

              {activeSection === "orders" && (
                <OrdersSection
                  settings={settings}
                  update={update}
                />
              )}

              {activeSection === "tax" && (
                <TaxSection
                  settings={settings}
                  update={update}
                />
              )}

              {activeSection === "communication" && (
                <CommunicationSection
                  settings={settings}
                  update={update}
                />
              )}

              {activeSection === "notifications" && (
                <NotificationsSection
                  settings={settings}
                  update={update}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   Shared UI
============================================================ */

type SectionProps = {
  settings: AppSettings;
  update: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => void;
};

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {children}

      {description && (
        <p className="mt-1.5 text-xs text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string | null | undefined;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      rows={rows}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50"
    >
      <div>
        <p className="text-sm font-medium text-gray-900">
          {label}
        </p>

        {description && (
          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        )}
      </div>

      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-gray-900" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

/* ============================================================
   GENERAL
============================================================ */

function GeneralSection({ settings, update }: SectionProps) {
  return (
    <>
      <SectionHeader
        title="General"
        description="Basic application-wide settings."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Application Name">
          <Input
            value={settings.app_name}
            onChange={(value) => update("app_name", value)}
          />
        </Field>

        <Field label="Shop Name">
          <Input
            value={settings.shop_name}
            onChange={(value) => update("shop_name", value)}
          />
        </Field>

        <Field label="Currency">
          <Input
            value={settings.currency}
            onChange={(value) => update("currency", value)}
          />
        </Field>

        <Field label="Currency Symbol">
          <Input
            value={settings.currency_symbol}
            onChange={(value) =>
              update("currency_symbol", value)
            }
          />
        </Field>

        <Field label="Timezone">
          <Input
            value={settings.timezone}
            onChange={(value) => update("timezone", value)}
          />
        </Field>

        <Field label="Date Format">
          <Input
            value={settings.date_format}
            onChange={(value) =>
              update("date_format", value)
            }
          />
        </Field>

        <Field label="Logo URL">
          <Input
            value={settings.logo_url}
            onChange={(value) => update("logo_url", value)}
            placeholder="https://..."
          />
        </Field>

        <Field label="Favicon URL">
          <Input
            value={settings.favicon_url}
            onChange={(value) =>
              update("favicon_url", value)
            }
            placeholder="https://..."
          />
        </Field>
      </div>
    </>
  );
}

/* ============================================================
   BUSINESS
============================================================ */

function BusinessSection({ settings, update }: SectionProps) {
  return (
    <>
      <SectionHeader
        title="Business Information"
        description="Information about your physical shop and business."
      />

      <div className="space-y-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Shop Name">
            <Input
              value={settings.shop_name}
              onChange={(value) => update("shop_name", value)}
            />
          </Field>

          <Field label="Legal Business Name">
            <Input
              value={settings.legal_business_name}
              onChange={(value) =>
                update("legal_business_name", value)
              }
            />
          </Field>

          <Field label="Owner Name">
            <Input
              value={settings.owner_name}
              onChange={(value) =>
                update("owner_name", value)
              }
            />
          </Field>

          <Field label="Business Email">
            <Input
              type="email"
              value={settings.business_email}
              onChange={(value) =>
                update("business_email", value)
              }
            />
          </Field>

          <Field label="Primary Phone">
            <Input
              value={settings.primary_phone}
              onChange={(value) =>
                update("primary_phone", value)
              }
            />
          </Field>

          <Field label="Secondary Phone">
            <Input
              value={settings.secondary_phone}
              onChange={(value) =>
                update("secondary_phone", value)
              }
            />
          </Field>

          <Field label="WhatsApp Number">
            <Input
              value={settings.whatsapp_number}
              onChange={(value) =>
                update("whatsapp_number", value)
              }
            />
          </Field>

          <Field label="GSTIN">
            <Input
              value={settings.gstin}
              onChange={(value) => update("gstin", value)}
            />
          </Field>

          <Field label="PAN">
            <Input
              value={settings.pan}
              onChange={(value) => update("pan", value)}
            />
          </Field>

          <Field label="Country">
            <Input
              value={settings.country}
              onChange={(value) =>
                update("country", value)
              }
            />
          </Field>
        </div>

        <Field label="Business Description">
          <Textarea
            value={settings.business_description}
            onChange={(value) =>
              update("business_description", value)
            }
            placeholder="Describe Vaishnavi Collections..."
          />
        </Field>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Address
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Address Line 1">
              <Input
                value={settings.address_line_1}
                onChange={(value) =>
                  update("address_line_1", value)
                }
              />
            </Field>

            <Field label="Address Line 2">
              <Input
                value={settings.address_line_2}
                onChange={(value) =>
                  update("address_line_2", value)
                }
              />
            </Field>

            <Field label="City">
              <Input
                value={settings.city}
                onChange={(value) =>
                  update("city", value)
                }
              />
            </Field>

            <Field label="State">
              <Input
                value={settings.state}
                onChange={(value) =>
                  update("state", value)
                }
              />
            </Field>

            <Field label="Postal Code">
              <Input
                value={settings.postal_code}
                onChange={(value) =>
                  update("postal_code", value)
                }
              />
            </Field>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   ONLINE STORE
============================================================ */

function OnlineSection({ settings, update }: SectionProps) {
  return (
    <>
      <SectionHeader
        title="Online Store"
        description="Control your online ordering and website configuration."
      />

      <div className="space-y-3">
        <Toggle
          checked={settings.online_orders_enabled}
          onChange={(value) =>
            update("online_orders_enabled", value)
          }
          label="Online Orders"
          description="Allow customers to place orders through the online store."
        />

        <Toggle
          checked={settings.order_preparation_enabled}
          onChange={(value) =>
            update("order_preparation_enabled", value)
          }
          label="Prepare Items on Order"
          description="Indicates that selected products can be prepared specifically on customer order."
        />

        <Toggle
          checked={settings.pan_india_shipping_enabled}
          onChange={(value) =>
            update("pan_india_shipping_enabled", value)
          }
          label="Pan-India Shipping"
          description="Show that online orders can be shipped across India."
        />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Website URL">
          <Input
            value={settings.website_url}
            onChange={(value) =>
              update("website_url", value)
            }
            placeholder="https://..."
          />
        </Field>

        <Field label="Online Store URL">
          <Input
            value={settings.online_store_url}
            onChange={(value) =>
              update("online_store_url", value)
            }
            placeholder="https://..."
          />
        </Field>
      </div>
    </>
  );
}

/* ============================================================
   SOCIAL
============================================================ */

function SocialSection({ settings, update }: SectionProps) {
  return (
    <>
      <SectionHeader
        title="Social & Reviews"
        description="Manage social profiles and customer review links."
      />

      <div className="space-y-3">
        <Toggle
          checked={settings.instagram_enabled}
          onChange={(value) =>
            update("instagram_enabled", value)
          }
          label="Instagram"
        />

        <Toggle
          checked={settings.facebook_enabled}
          onChange={(value) =>
            update("facebook_enabled", value)
          }
          label="Facebook"
        />

        <Toggle
          checked={settings.youtube_enabled}
          onChange={(value) =>
            update("youtube_enabled", value)
          }
          label="YouTube"
        />

        <Toggle
          checked={settings.google_review_enabled}
          onChange={(value) =>
            update("google_review_enabled", value)
          }
          label="Google Reviews"
        />
      </div>

      <div className="mt-8 grid gap-5">
        <Field label="Instagram URL">
          <Input
            value={settings.instagram_url}
            onChange={(value) =>
              update("instagram_url", value)
            }
            placeholder="https://instagram.com/..."
          />
        </Field>

        <Field label="Facebook URL">
          <Input
            value={settings.facebook_url}
            onChange={(value) =>
              update("facebook_url", value)
            }
          />
        </Field>

        <Field label="YouTube URL">
          <Input
            value={settings.youtube_url}
            onChange={(value) =>
              update("youtube_url", value)
            }
          />
        </Field>

        <Field label="Google Business Profile URL">
          <Input
            value={settings.google_business_url}
            onChange={(value) =>
              update("google_business_url", value)
            }
          />
        </Field>

        <Field
          label="Google Review URL"
          description="Used for customer review requests."
        >
          <Input
            value={settings.google_review_url}
            onChange={(value) =>
              update("google_review_url", value)
            }
          />
        </Field>

        <Field label="WhatsApp URL">
          <Input
            value={settings.whatsapp_url}
            onChange={(value) =>
              update("whatsapp_url", value)
            }
          />
        </Field>
      </div>
    </>
  );
}

/* ============================================================
   BUSINESS HOURS
============================================================ */

const days = [
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"],
] as const;

function HoursSection({ settings, update }: SectionProps) {
  return (
    <>
      <SectionHeader
        title="Business Hours"
        description="Set the opening and closing hours of your shop."
      />

      <Toggle
        checked={settings.business_hours_enabled}
        onChange={(value) =>
          update("business_hours_enabled", value)
        }
        label="Business Hours Enabled"
        description="Display your shop's opening hours throughout the application."
      />

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
        <div className="hidden grid-cols-[1fr_1fr_1fr] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid">
          <div>Day</div>
          <div>Opening</div>
          <div>Closing</div>
        </div>

        {days.map(([key, label]) => {
          const openKey =
            `${key}_open` as keyof AppSettings;
          const closeKey =
            `${key}_close` as keyof AppSettings;

          return (
            <div
              key={key}
              className="grid gap-3 border-b border-gray-200 p-4 last:border-b-0 sm:grid-cols-[1fr_1fr_1fr] sm:items-center"
            >
              <div className="text-sm font-medium text-gray-900">
                {label}
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-400 sm:hidden">
                  Opening
                </label>

                <Input
                  type="time"
                  value={settings[openKey] as string | null}
                  onChange={(value) =>
                    update(openKey, value)
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-400 sm:hidden">
                  Closing
                </label>

                <Input
                  type="time"
                  value={settings[closeKey] as string | null}
                  onChange={(value) =>
                    update(closeKey, value)
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ============================================================
   INVENTORY
============================================================ */

function InventorySection({ settings, update }: SectionProps) {
  return (
    <>
      <SectionHeader
        title="Inventory"
        description="Control stock behaviour and inventory alerts."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Low Stock Threshold"
          description="Products at or below this quantity will be considered low stock."
        >
          <Input
            type="number"
            value={settings.low_stock_threshold}
            onChange={(value) =>
              update(
                "low_stock_threshold",
                Number(value)
              )
            }
          />
        </Field>
      </div>

      <div className="mt-6 space-y-3">
        <Toggle
          checked={settings.allow_negative_stock}
          onChange={(value) =>
            update("allow_negative_stock", value)
          }
          label="Allow Negative Stock"
          description="Allow sales to reduce inventory below zero."
        />

        <Toggle
          checked={settings.low_stock_alerts_enabled}
          onChange={(value) =>
            update("low_stock_alerts_enabled", value)
          }
          label="Low Stock Alerts"
          description="Notify administrators when products reach the low-stock threshold."
        />
      </div>
    </>
  );
}

/* ============================================================
   ORDERS
============================================================ */

function OrdersSection({ settings, update }: SectionProps) {
  return (
    <>
      <SectionHeader
        title="Orders & Sales"
        description="Configure order amounts, shipping and invoices."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Minimum Order Amount">
          <Input
            type="number"
            value={settings.minimum_order_amount}
            onChange={(value) =>
              update(
                "minimum_order_amount",
                Number(value)
              )
            }
          />
        </Field>

        <Field label="Default Shipping Charge">
          <Input
            type="number"
            value={settings.default_shipping_charge}
            onChange={(value) =>
              update(
                "default_shipping_charge",
                Number(value)
              )
            }
          />
        </Field>

        <Field label="Free Shipping Threshold">
          <Input
            type="number"
            value={
              settings.free_shipping_threshold ?? ""
            }
            onChange={(value) =>
              update(
                "free_shipping_threshold",
                value === "" ? null : Number(value)
              )
            }
          />
        </Field>

        <Field label="Invoice Prefix">
          <Input
            value={settings.invoice_prefix}
            onChange={(value) =>
              update("invoice_prefix", value)
            }
          />
        </Field>
      </div>

      <div className="mt-6">
        <Field label="Invoice Terms">
          <Textarea
            value={settings.invoice_terms}
            onChange={(value) =>
              update("invoice_terms", value)
            }
            placeholder="Enter invoice terms and conditions..."
          />
        </Field>
      </div>
    </>
  );
}

/* ============================================================
   TAX
============================================================ */

function TaxSection({ settings, update }: SectionProps) {
  return (
    <>
      <SectionHeader
        title="Tax"
        description="Configure tax and GST behaviour."
      />

      <Toggle
        checked={settings.tax_enabled}
        onChange={(value) =>
          update("tax_enabled", value)
        }
        label="Enable Tax"
        description="Enable tax calculations where supported by the application."
      />

      <div className="mt-6 max-w-sm">
        <Field label="Default Tax Rate (%)">
          <Input
            type="number"
            value={settings.tax_rate}
            onChange={(value) =>
              update("tax_rate", Number(value))
            }
          />
        </Field>
      </div>
    </>
  );
}

/* ============================================================
   COMMUNICATION
============================================================ */

function CommunicationSection({
  settings,
  update,
}: SectionProps) {
  return (
    <>
      <SectionHeader
        title="Communication"
        description="Customer support information and order messages."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Customer Support Phone">
          <Input
            value={settings.customer_support_phone}
            onChange={(value) =>
              update("customer_support_phone", value)
            }
          />
        </Field>

        <Field label="Customer Support Email">
          <Input
            type="email"
            value={settings.customer_support_email}
            onChange={(value) =>
              update("customer_support_email", value)
            }
          />
        </Field>
      </div>

      <div className="mt-6 space-y-5">
        <Field label="Order Confirmation Message">
          <Textarea
            value={settings.order_confirmation_message}
            onChange={(value) =>
              update(
                "order_confirmation_message",
                value
              )
            }
          />
        </Field>

        <Field label="Order Footer Message">
          <Textarea
            value={settings.order_footer_message}
            onChange={(value) =>
              update("order_footer_message", value)
            }
          />
        </Field>

        <Field label="Receipt Footer Message">
          <Textarea
            value={settings.receipt_footer_message}
            onChange={(value) =>
              update(
                "receipt_footer_message",
                value
              )
            }
          />
        </Field>
      </div>
    </>
  );
}

/* ============================================================
   NOTIFICATIONS
============================================================ */

function NotificationsSection({
  settings,
  update,
}: SectionProps) {
  return (
    <>
      <SectionHeader
        title="Notifications"
        description="Control administrative notifications and alerts."
      />

      <Toggle
        checked={settings.new_order_alerts_enabled}
        onChange={(value) =>
          update(
            "new_order_alerts_enabled",
            value
          )
        }
        label="New Order Alerts"
        description="Notify administrators when a new online order is received."
      />

      <div className="mt-6 max-w-xl">
        <Field
          label="Notification Email"
          description="Email address used for application notifications."
        >
          <Input
            type="email"
            value={settings.notification_email}
            onChange={(value) =>
              update("notification_email", value)
            }
          />
        </Field>
      </div>
    </>
  );
}