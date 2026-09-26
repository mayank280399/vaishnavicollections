"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { SettingsSectionCard } from "./settings-section-card";

export function ShopSettings() {
  const [gstEnabled, setGstEnabled] = useState(false);

  const [form, setForm] = useState({
    shopName: "Vaishnavi Collections",
    businessName: "",
    ownerName: "",
    phone: "",
    whatsapp: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    googleMapsUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    websiteUrl: "",
    logoUrl: "",
    description: "",
    gstin: "",
  });

  const update = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Shop settings:", {
      ...form,
      gstEnabled,
    });
  };

  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title="Business Information"
        description="Information about your shop that can be used throughout the application."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="shop-name">Shop Name *</Label>

            <Input
              id="shop-name"
              value={form.shopName}
              onChange={(e) =>
                update("shopName", e.target.value)
              }
              placeholder="Vaishnavi Collections"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-name">
              Legal / Business Name
            </Label>

            <Input
              id="business-name"
              value={form.businessName}
              onChange={(e) =>
                update("businessName", e.target.value)
              }
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner-name">
              Owner Name
            </Label>

            <Input
              id="owner-name"
              value={form.ownerName}
              onChange={(e) =>
                update("ownerName", e.target.value)
              }
              placeholder="Owner name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>

            <Input
              id="phone"
              value={form.phone}
              onChange={(e) =>
                update("phone", e.target.value)
              }
              placeholder="Shop phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>

            <Input
              id="whatsapp"
              value={form.whatsapp}
              onChange={(e) =>
                update("whatsapp", e.target.value)
              }
              placeholder="WhatsApp number"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                update("email", e.target.value)
              }
              placeholder="shop@example.com"
            />
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Shop Address"
        description="Used for invoices, receipts and customer-facing information."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address-line-1">
              Address Line 1
            </Label>

            <Input
              id="address-line-1"
              value={form.addressLine1}
              onChange={(e) =>
                update("addressLine1", e.target.value)
              }
              placeholder="Shop address"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address-line-2">
              Address Line 2
            </Label>

            <Input
              id="address-line-2"
              value={form.addressLine2}
              onChange={(e) =>
                update("addressLine2", e.target.value)
              }
              placeholder="Area / landmark"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>

            <Input
              id="city"
              value={form.city}
              onChange={(e) =>
                update("city", e.target.value)
              }
              placeholder="City"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>

            <Input
              id="state"
              value={form.state}
              onChange={(e) =>
                update("state", e.target.value)
              }
              placeholder="State"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>

            <Input
              id="pincode"
              inputMode="numeric"
              value={form.pincode}
              onChange={(e) =>
                update("pincode", e.target.value)
              }
              placeholder="Pincode"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="google-maps">
              Google Maps URL
            </Label>

            <Input
              id="google-maps"
              value={form.googleMapsUrl}
              onChange={(e) =>
                update("googleMapsUrl", e.target.value)
              }
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Online Presence"
        description="Links that can be used across your customer-facing experience."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">
              Instagram URL
            </Label>

            <Input
              id="instagram"
              value={form.instagramUrl}
              onChange={(e) =>
                update("instagramUrl", e.target.value)
              }
              placeholder="https://instagram.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">
              Facebook URL
            </Label>

            <Input
              id="facebook"
              value={form.facebookUrl}
              onChange={(e) =>
                update("facebookUrl", e.target.value)
              }
              placeholder="https://facebook.com/..."
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="website">Website URL</Label>

            <Input
              id="website"
              value={form.websiteUrl}
              onChange={(e) =>
                update("websiteUrl", e.target.value)
              }
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="logo-url">Logo URL</Label>

            <Input
              id="logo-url"
              value={form.logoUrl}
              onChange={(e) =>
                update("logoUrl", e.target.value)
              }
              placeholder="Logo image URL"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">
              Business Description
            </Label>

            <textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                update("description", e.target.value)
              }
              rows={4}
              className="flex w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              placeholder="Short description about your shop..."
            />
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Tax Information"
        description="Optional tax information used for invoices and reports."
      >
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">
                GST Registered
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Enable this if your business is GST registered.
              </p>
            </div>

            <input
              type="checkbox"
              checked={gstEnabled}
              onChange={(e) =>
                setGstEnabled(e.target.checked)
              }
              className="h-4 w-4"
            />
          </label>

          {gstEnabled && (
            <div className="max-w-md space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>

              <Input
                id="gstin"
                value={form.gstin}
                onChange={(e) =>
                  update("gstin", e.target.value)
                }
                placeholder="Enter GSTIN"
              />
            </div>
          )}
        </div>
      </SettingsSectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Business Information
        </Button>
      </div>
    </div>
  );
}