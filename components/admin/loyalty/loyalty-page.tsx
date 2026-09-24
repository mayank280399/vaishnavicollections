"use client";

import {
  Gift,
  IndianRupee,
  Users,
  Stamp,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { LoyaltyStatCard } from "./loyalty-stat-card";
import { LoyaltyTabs } from "./loyalty-tabs";
import { LoyaltyCustomerCard } from "./loyalty-customer-card";
import { LoyaltyCustomerTable } from "./loyalty-customer-table";
import { LoyaltyCustomerDialog } from "./loyalty-customer-dialog";
import { LoyaltyRewards } from "./loyalty-rewards";
import { LoyaltySettings } from "./loyalty-settings";

import type {
  LoyaltyCustomer,
  LoyaltyReward,
  LoyaltySettings as LoyaltySettingsType,
  LoyaltyStats,
} from "@/lib/loyalty/loyalty-types";

import {
  adjustCustomerPoints,
  createReward,
  getLoyaltyCustomers,
  getLoyaltyRewards,
  getLoyaltySettings,
  getLoyaltyStats,
  toggleReward,
  updateLoyaltySettings,
} from "@/lib/loyalty/loyalty-queries";

type Tab =
  | "overview"
  | "customers"
  | "rewards"
  | "settings";

export function LoyaltyPage() {
  const [tab, setTab] =
    useState<Tab>("overview");

  const [settings, setSettings] =
    useState<LoyaltySettingsType | null>(null);

  const [customers, setCustomers] =
    useState<LoyaltyCustomer[]>([]);

  const [rewards, setRewards] =
    useState<LoyaltyReward[]>([]);

  const [stats, setStats] =
    useState<LoyaltyStats | null>(null);

  const [selectedCustomer, setSelectedCustomer] =
    useState<LoyaltyCustomer | null>(null);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        settingsData,
        customersData,
        rewardsData,
        statsData,
      ] = await Promise.all([
        getLoyaltySettings(),
        getLoyaltyCustomers(),
        getLoyaltyRewards(),
        getLoyaltyStats(),
      ]);

      setSettings(settingsData);
      setCustomers(customersData);
      setRewards(rewardsData);
      setStats(statsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load loyalty data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleViewCustomer(
    customer: LoyaltyCustomer
  ) {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  }

  async function handleAdjust(
    customerId: string,
    amount: number,
    description: string
  ) {
    await adjustCustomerPoints(
      customerId,
      amount,
      description
    );

    await loadData();

    const updatedCustomer =
      customers.find(
        (customer) => customer.id === customerId
      );

    if (updatedCustomer) {
      setSelectedCustomer({
        ...updatedCustomer,
        points_balance:
          updatedCustomer.points_balance + amount,
      });
    }
  }

  async function handleSettingsSave(
    values: Partial<LoyaltySettingsType>
  ) {
    if (!settings) return;

    await updateLoyaltySettings(
      settings.id,
      {
        spend_per_stamp:
          values.spend_per_stamp ??
          settings.spend_per_stamp,

        reward_expiry_days:
          values.reward_expiry_days ??
          settings.reward_expiry_days,

        minimum_redemption_points:
          values.minimum_redemption_points ??
          settings.minimum_redemption_points,

        maximum_redemption_percentage:
          values.maximum_redemption_percentage ??
          settings.maximum_redemption_percentage,

        repeat_bonus_enabled:
          settings.repeat_bonus_enabled,

        referral_bonus_enabled:
          settings.referral_bonus_enabled,
      }
    );

    await loadData();
  }

  async function handleToggleReward(
    rewardId: string,
    active: boolean
  ) {
    await toggleReward(rewardId, active);
    await loadData();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>

        <div className="h-12 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold">
          Unable to load Loyalty
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {error}
        </p>
      </div>
    );
  }

  if (!settings || !stats) {
    return null;
  }

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}

      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Stamp className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Loyalty
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage customer stamps and rewards
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <LoyaltyStatCard
          title="Customers"
          value={stats.total_customers.toLocaleString(
            "en-IN"
          )}
          description={`${stats.enrolled_customers} enrolled`}
          icon={Users}
        />

        <LoyaltyStatCard
          title="Stamps"
          value={stats.total_stamps.toLocaleString(
            "en-IN"
          )}
          description="Current balances"
          icon={Stamp}
        />

        <LoyaltyStatCard
          title="Rewards"
          value={stats.total_rewards.toLocaleString(
            "en-IN"
          )}
          description={`${stats.active_rewards} active`}
          icon={Gift}
        />

        <LoyaltyStatCard
          title="Redemptions"
          value={stats.redeemed_rewards.toLocaleString(
            "en-IN"
          )}
          description="Total redeemed"
          icon={IndianRupee}
        />
      </div>

      {/* CURRENT RULE */}

      <div className="rounded-2xl border bg-primary/5 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Current Loyalty Rule
            </p>

            <p className="text-xs text-muted-foreground">
              Customers earn stamps based on their purchase
              amount.
            </p>
          </div>

          <div className="mt-2 rounded-xl bg-background px-4 py-2 text-sm font-bold sm:mt-0">
            ₹
            {settings.spend_per_stamp.toLocaleString(
              "en-IN"
            )}{" "}
            = 1 Stamp
          </div>
        </div>
      </div>

      {/* TABS */}

      <LoyaltyTabs
        value={tab}
        onChange={setTab}
      />

      {/* CONTENT */}

      {tab === "overview" && (
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">
              Loyalty Overview
            </h2>

            <p className="text-sm text-muted-foreground">
              Your customer loyalty program at a glance.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Stamp className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold">
                  How stamps work
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Customers earn 1 stamp for every ₹
                  {settings.spend_per_stamp.toLocaleString(
                    "en-IN"
                  )}{" "}
                  spent.
                </p>
              </div>
            </div>
          </div>

          {customers.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold">
                Customers
              </h2>

              <LoyaltyCustomerTable
                customers={customers.slice(0, 10)}
                onView={handleViewCustomer}
              />
            </div>
          )}
        </div>
      )}

      {tab === "customers" && (
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">
              Customers
            </h2>

            <p className="text-sm text-muted-foreground">
              View customer loyalty balances and activity.
            </p>
          </div>

          {customers.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground" />

              <h3 className="mt-3 font-semibold">
                No customers yet
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Customers will appear here once they are
                added to your shop.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {customers.map((customer) => (
                  <LoyaltyCustomerCard
                    key={customer.id}
                    customer={customer}
                    spendPerStamp={
                      settings.spend_per_stamp
                    }
                    onView={handleViewCustomer}
                  />
                ))}
              </div>

              <LoyaltyCustomerTable
                customers={customers}
                onView={handleViewCustomer}
              />
            </>
          )}
        </div>
      )}

      {tab === "rewards" && (
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">
              Rewards
            </h2>

            <p className="text-sm text-muted-foreground">
              Manage rewards customers can redeem.
            </p>
          </div>

          <LoyaltyRewards
            rewards={rewards}
            onToggle={handleToggleReward}
          />
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">
              Loyalty Settings
            </h2>

            <p className="text-sm text-muted-foreground">
              Configure how your loyalty program works.
            </p>
          </div>

          <LoyaltySettings
            settings={settings}
            onSave={handleSettingsSave}
          />
        </div>
      )}

      <LoyaltyCustomerDialog
        customer={selectedCustomer}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdjust={handleAdjust}
      />
    </div>
  );
}