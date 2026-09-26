"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { SettingsSectionCard } from "./settings-section-card";

export function InvoiceSettings() {
  const [prefix, setPrefix] = useState("VC");
  const [nextNumber, setNextNumber] = useState("1");
  const [padding, setPadding] = useState("6");
  const [footer, setFooter] = useState(
    "Thank you for shopping with us!"
  );

  const [options, setOptions] = useState({
    logo: true,
    address: true,
    phone: true,
    instagram: true,
    maps: false,
    customer: true,
    payment: true,
    tax: true,
  });

  const toggle = (key: keyof typeof options) => {
    setOptions((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleSave = () => {
    console.log({
      prefix,
      nextNumber,
      padding,
      footer,
      options,
    });
  };

  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title="Invoice Numbering"
        description="Configure how invoices are numbered."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="invoice-prefix">
              Prefix
            </Label>

            <Input
              id="invoice-prefix"
              value={prefix}
              onChange={(e) =>
                setPrefix(e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next-number">
              Next Number
            </Label>

            <Input
              id="next-number"
              type="number"
              min="1"
              value={nextNumber}
              onChange={(e) =>
                setNextNumber(e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="padding">
              Number Padding
            </Label>

            <Input
              id="padding"
              type="number"
              min="1"
              max="10"
              value={padding}
              onChange={(e) =>
                setPadding(e.target.value)
              }
            />
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
          Example:{" "}
          <span className="font-semibold">
            {prefix || "VC"}-
            {String(nextNumber || 1).padStart(
              Number(padding) || 6,
              "0"
            )}
          </span>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Invoice Content"
        description="Choose what information appears on invoices."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <InvoiceToggle
            label="Show Logo"
            checked={options.logo}
            onChange={() => toggle("logo")}
          />

          <InvoiceToggle
            label="Show Address"
            checked={options.address}
            onChange={() => toggle("address")}
          />

          <InvoiceToggle
            label="Show Phone"
            checked={options.phone}
            onChange={() => toggle("phone")}
          />

          <InvoiceToggle
            label="Show Instagram"
            checked={options.instagram}
            onChange={() => toggle("instagram")}
          />

          <InvoiceToggle
            label="Show Google Maps"
            checked={options.maps}
            onChange={() => toggle("maps")}
          />

          <InvoiceToggle
            label="Show Customer Information"
            checked={options.customer}
            onChange={() => toggle("customer")}
          />

          <InvoiceToggle
            label="Show Payment Method"
            checked={options.payment}
            onChange={() => toggle("payment")}
          />

          <InvoiceToggle
            label="Show Tax Information"
            checked={options.tax}
            onChange={() => toggle("tax")}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Invoice Footer"
        description="Optional message displayed at the bottom of invoices."
      >
        <div className="space-y-2">
          <Label htmlFor="invoice-footer">
            Footer Message
          </Label>

          <textarea
            id="invoice-footer"
            rows={3}
            value={footer}
            onChange={(e) =>
              setFooter(e.target.value)
            }
            className="flex w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>
      </SettingsSectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Invoice Settings
        </Button>
      </div>
    </div>
  );
}

function InvoiceToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border p-3">
      <span className="text-sm font-medium">
        {label}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4"
      />
    </label>
  );
}