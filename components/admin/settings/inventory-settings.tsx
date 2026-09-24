"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { SettingsSectionCard } from "./settings-section-card";

export function InventorySettings() {
  const [lowStockThreshold, setLowStockThreshold] =
    useState("5");

  const [defaultStock, setDefaultStock] =
    useState("0");

  const [allowNegativeStock, setAllowNegativeStock] =
    useState(false);

  const [autoSale, setAutoSale] = useState(true);
  const [autoPurchase, setAutoPurchase] =
    useState(true);

  const handleSave = () => {
    console.log({
      lowStockThreshold,
      defaultStock,
      allowNegativeStock,
      autoSale,
      autoPurchase,
    });
  };

  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title="Stock Management"
        description="Control how product stock is handled throughout the application."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="low-stock">
              Low Stock Threshold
            </Label>

            <Input
              id="low-stock"
              type="number"
              min="0"
              value={lowStockThreshold}
              onChange={(e) =>
                setLowStockThreshold(e.target.value)
              }
            />

            <p className="text-xs text-muted-foreground">
              Products at or below this quantity are
              considered low stock.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-stock">
              Default Stock Quantity
            </Label>

            <Input
              id="default-stock"
              type="number"
              min="0"
              value={defaultStock}
              onChange={(e) =>
                setDefaultStock(e.target.value)
              }
            />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <SettingToggle
            title="Allow Negative Stock"
            description="Allow stock to go below zero."
            checked={allowNegativeStock}
            onChange={setAllowNegativeStock}
          />

          <SettingToggle
            title="Automatically Update Stock on Sale"
            description="Reduce product stock when a sale is completed."
            checked={autoSale}
            onChange={setAutoSale}
          />

          <SettingToggle
            title="Automatically Update Stock on Purchase"
            description="Increase product stock when a purchase is completed."
            checked={autoPurchase}
            onChange={setAutoPurchase}
          />
        </div>
      </SettingsSectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Inventory Settings
        </Button>
      </div>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="h-4 w-4 shrink-0"
      />
    </label>
  );
}