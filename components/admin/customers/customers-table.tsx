"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

import CustomerDialog from "./customer-dialog";

type Customer = {
  id: string;
  profile_id: string | null;
  customer_code: string;
  display_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  city: string | null;
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

type Sale = {
  id: string;
  invoice_number: string | null;
  purchased_at: string;
  total_amount: number | string;
  payment_method: string;
  status: string;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function money(value: number | string | null | undefined) {
  return currency.format(Number(value ?? 0) || 0);
}

function number(value: number | string | null | undefined) {
  return Number(value ?? 0) || 0;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return dateFormatter.format(date);
}

function sourceLabel(value: string | null) {
  switch (value) {
    case "PHYSICAL_SHOP":
      return "Physical Shop";
    case "INSTAGRAM":
      return "Instagram";
    case "REFERRAL":
      return "Referral";
    case "ONLINE":
      return "Online";
    case "OTHER":
      return "Other";
    default:
      return value || "—";
  }
}

function segmentLabel(value: string | null) {
  if (!value) return "—";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function segmentClass(value: string | null) {
  switch (value) {
    case "VIP":
      return "bg-amber-100 text-amber-800";
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-800";
    case "NEW":
      return "bg-blue-100 text-blue-800";
    case "INACTIVE":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function CustomersTable() {
  const supabase = useMemo(() => createClient(), []);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [segmentFilter, setSegmentFilter] = useState("ALL");

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [viewingCustomer, setViewingCustomer] =
    useState<Customer | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadCustomers() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        id,
        profile_id,
        customer_code,
        display_name,
        phone,
        email,
        date_of_birth,
        gender,
        city,
        source,
        first_purchase_at,
        last_purchase_at,
        total_orders,
        total_spent,
        lifetime_profit,
        customer_segment,
        created_at,
        updated_at
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load customers:", error);
      setCustomers([]);
    } else {
      setCustomers((data ?? []) as Customer[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.customer_code.toLowerCase().includes(query) ||
        customer.display_name.toLowerCase().includes(query) ||
        (customer.phone ?? "").toLowerCase().includes(query) ||
        (customer.email ?? "").toLowerCase().includes(query) ||
        (customer.city ?? "").toLowerCase().includes(query);

      const matchesSource =
        sourceFilter === "ALL" ||
        customer.source === sourceFilter;

      const matchesSegment =
        segmentFilter === "ALL" ||
        customer.customer_segment === segmentFilter;

      return matchesSearch && matchesSource && matchesSegment;
    });
  }, [customers, search, sourceFilter, segmentFilter]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) =>
      customer.customer_segment === "ACTIVE" ||
      customer.customer_segment === "VIP"
  ).length;

  const totalSpent = customers.reduce(
    (sum, customer) => sum + number(customer.total_spent),
    0
  );

  const averageSpend =
    totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  const resetFilters = () => {
    setSearch("");
    setSourceFilter("ALL");
    setSegmentFilter("ALL");
  };

  async function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(
      `Delete customer "${customer.display_name}"?\n\nThis should only be done if the customer has no dependent records.`
    );

    if (!confirmed) return;

    setDeletingId(customer.id);

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customer.id);

    setDeletingId(null);

    if (error) {
      window.alert(`Unable to delete customer: ${error.message}`);
      return;
    }

    await loadCustomers();
  }

  return (
    <div className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Customers
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage customer profiles, purchase activity and customer value.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            onClick={loadCustomers}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <CustomerDialog
            showTrigger
            onSaved={loadCustomers}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="Total Customers"
          value={totalCustomers.toLocaleString("en-IN")}
          description="Customer profiles"
        />

        <MetricCard
          icon={<UserRound className="h-5 w-5" />}
          label="Active Customers"
          value={activeCustomers.toLocaleString("en-IN")}
          description="Active and VIP customers"
        />

        <MetricCard
          icon={<Wallet className="h-5 w-5" />}
          label="Total Customer Spend"
          value={money(totalSpent)}
          description="Across customer records"
        />

        <MetricCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Average Spend"
          value={money(averageSpend)}
          description="Average per customer"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, customer code, phone, email or city..."
              className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-11 rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="ALL">All Sources</option>
              <option value="PHYSICAL_SHOP">Physical Shop</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="REFERRAL">Referral</option>
              <option value="ONLINE">Online</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="h-11 rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="ALL">All Segments</option>

              {Array.from(
                new Set(
                  customers
                    .map((customer) => customer.customer_segment)
                    .filter(Boolean)
                )
              ).map((segment) => (
                <option key={segment} value={segment!}>
                  {segmentLabel(segment)}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={resetFilters}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Showing {filteredCustomers.length} of {customers.length} customers
          </span>

          {search || sourceFilter !== "ALL" || segmentFilter !== "ALL" ? (
            <span>Filters are active</span>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold">
                  Customer
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Contact
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Source
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Segment
                </th>

                <th className="px-4 py-3 text-right font-semibold">
                  Orders
                </th>

                <th className="px-4 py-3 text-right font-semibold">
                  Spent
                </th>

                <th className="px-4 py-3 text-left font-semibold">
                  Last Purchase
                </th>

                <th className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading customers...
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <h3 className="mt-3 font-semibold">
                        No customers found
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b last:border-b-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                          {customer.display_name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setViewingCustomer(customer)}
                            className="max-w-[220px] truncate text-left font-semibold hover:text-primary"
                          >
                            {customer.display_name}
                          </button>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {customer.customer_code}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {customer.phone ? (
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        ) : null}

                        {customer.email ? (
                          <div className="flex max-w-[220px] items-center gap-2 truncate text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {customer.email}
                            </span>
                          </div>
                        ) : null}

                        {!customer.phone && !customer.email ? "—" : null}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {sourceLabel(customer.source)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${segmentClass(
                          customer.customer_segment
                        )}`}
                      >
                        {segmentLabel(customer.customer_segment)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right font-medium">
                      {number(customer.total_orders).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-4 text-right font-semibold">
                      {money(customer.total_spent)}
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(customer.last_purchase_at)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg"
                          title="View customer"
                          onClick={() => setViewingCustomer(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg"
                          title="Edit customer"
                          onClick={() => setEditingCustomer(customer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-destructive hover:text-destructive"
                          title="Delete customer"
                          disabled={deletingId === customer.id}
                          onClick={() => deleteCustomer(customer)}
                        >
                          {deletingId === customer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit */}
      {editingCustomer ? (
        <CustomerDialog
          editCustomer={editingCustomer}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setEditingCustomer(null);
            }
          }}
          onSaved={loadCustomers}
        />
      ) : null}

      {/* View customer */}
      {viewingCustomer ? (
        <CustomerDetailsDialog
          customer={viewingCustomer}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setViewingCustomer(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function CustomerDetailsDialog({
  customer,
  open,
  onOpenChange,
}: {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const supabase = useMemo(() => createClient(), []);

  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function loadSales() {
      setLoadingSales(true);

      const { data, error } = await supabase
        .from("sales")
        .select(
          "id,invoice_number,purchased_at,total_amount,payment_method,status"
        )
        .eq("customer_id", customer.id)
        .order("purchased_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Failed to load customer sales:", error);
        setSales([]);
      } else {
        setSales((data ?? []) as Sale[]);
      }

      setLoadingSales(false);
    }

    loadSales();
  }, [open, customer.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
  className="
    !w-[calc(100vw-1rem)]
    !max-w-4xl
    max-h-[85vh]
    overflow-hidden
    rounded-2xl
    bg-white
    p-0
    text-slate-900
  "
>
        <DialogHeader className="border-b px-5 py-4 sm:px-6">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {customer.display_name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="truncate">
                {customer.display_name}
              </div>

              <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                {customer.customer_code}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 p-5 sm:p-6">
          {/* Customer summary */}
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            <DetailMetric
              label="Total Orders"
              value={number(customer.total_orders).toLocaleString("en-IN")}
            />

            <DetailMetric
              label="Total Spent"
              value={money(customer.total_spent)}
            />

            <DetailMetric
              label="Lifetime Profit"
              value={money(customer.lifetime_profit)}
            />

            <DetailMetric
              label="Segment"
              value={segmentLabel(customer.customer_segment)}
            />
          </div>

          {/* Profile */}
          <section className="rounded-2xl border p-4 sm:p-5">
            <h3 className="text-sm font-semibold">
              Customer Information
            </h3>

            <div className="mt-4 flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={customer.phone || "—"}
              />

              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={customer.email || "—"}
              />

              <InfoItem
                icon={<MapPin className="h-4 w-4" />}
                label="City"
                value={customer.city || "—"}
              />

              <InfoItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="Date of Birth"
                value={formatDate(customer.date_of_birth)}
              />

              <InfoItem
                icon={<UserRound className="h-4 w-4" />}
                label="Gender"
                value={customer.gender || "—"}
              />

              <InfoItem
                icon={<ShoppingBag className="h-4 w-4" />}
                label="Source"
                value={sourceLabel(customer.source)}
              />
            </div>
          </section>

          {/* Purchase history */}
          <section className="rounded-2xl border p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">
                  Purchase History
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Recent sales linked to this customer.
                </p>
              </div>

              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-4 py-3 text-left font-semibold">
                        Invoice
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Date
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Payment
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingSales ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading purchase history...
                          </div>
                        </td>
                      </tr>
                    ) : sales.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-sm text-muted-foreground"
                        >
                          No purchase history found.
                        </td>
                      </tr>
                    ) : (
                      sales.map((sale) => (
                        <tr
                          key={sale.id}
                          className="border-b last:border-b-0"
                        >
                          <td className="px-4 py-3 font-medium">
                            {sale.invoice_number || "—"}
                          </td>

                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDate(sale.purchased_at)}
                          </td>

                          <td className="px-4 py-3">
                            {sale.payment_method}
                          </td>

                          <td className="px-4 py-3">
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                              {sale.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right font-semibold">
                            {money(sale.total_amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Dates */}
          <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <span>
              First purchase: {formatDate(customer.first_purchase_at)}
            </span>

            <span>
              Last purchase: {formatDate(customer.last_purchase_at)}
            </span>

            <span>
              Customer since: {formatDate(customer.created_at)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-muted/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}