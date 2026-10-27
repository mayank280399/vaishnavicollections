"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgePercent, CalendarClock, Plus, RefreshCw, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { listPromotions, savePromotion, setPromotionActive, type PromotionInput } from "@/lib/promotions/actions";

type Promotion = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: "FIXED" | "PERCENTAGE";
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  usage_limit: number | null;
  per_customer_limit: number;
  starts_at: string | null;
  ends_at: string | null;
  first_order_only: boolean;
  active: boolean;
  created_at: string;
};

const blank: PromotionInput = {
  code: "",
  name: "",
  description: "",
  discount_type: "FIXED",
  discount_value: 50,
  minimum_order_amount: 699,
  maximum_discount_amount: null,
  usage_limit: null,
  per_customer_limit: 1,
  starts_at: "",
  ends_at: "",
  first_order_only: true,
  active: false,
};

const money = (value: number) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const dateInput = (value: string | null) => value ? new Date(value).toISOString().slice(0, 16) : "";

export default function PromotionsAdminPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [form, setForm] = useState<PromotionInput>(blank);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPromotions(await listPromotions() as Promotion[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load promotions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  function update<K extends keyof PromotionInput>(key: K, value: PromotionInput[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function edit(p: Promotion) {
    setEditingId(p.id);
    setForm({
      code: p.code, name: p.name, description: p.description ?? "",
      discount_type: p.discount_type, discount_value: Number(p.discount_value),
      minimum_order_amount: Number(p.minimum_order_amount),
      maximum_discount_amount: p.maximum_discount_amount == null ? null : Number(p.maximum_discount_amount),
      usage_limit: p.usage_limit == null ? null : Number(p.usage_limit),
      per_customer_limit: Number(p.per_customer_limit),
      starts_at: dateInput(p.starts_at), ends_at: dateInput(p.ends_at),
      first_order_only: p.first_order_only, active: p.active,
    });
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(undefined);
    setForm(blank);
    setError("");
    setNotice("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const starts = form.starts_at ? new Date(form.starts_at).toISOString() : null;
      const ends = form.ends_at ? new Date(form.ends_at).toISOString() : null;
      await savePromotion({ ...form, starts_at: starts, ends_at: ends }, editingId);
      setNotice(editingId ? "Promotion updated." : "Promotion created.");
      resetForm();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save promotion.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(p: Promotion) {
    setError(""); setNotice("");
    try {
      await setPromotionActive(p.id, !p.active);
      setNotice(`${p.code} ${p.active ? "paused" : "activated"}.`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update promotion.");
    }
  }

  return (
    <main className="min-h-full space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071A35] text-[#D4AF37]"><BadgePercent size={22} /></span>
          <div><h1 className="text-2xl font-bold text-[#071A35]">Promotions & Coupons</h1><p className="mt-1 text-sm text-slate-500">Configure offers, eligibility, usage limits and campaign dates.</p></div>
        </div>
        <button onClick={() => void refresh()} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"><RefreshCw size={15} /> Refresh</button>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><h2 className="font-semibold text-slate-900">{editingId ? "Edit promotion" : "Create promotion"}</h2><p className="mt-1 text-xs text-slate-500">New offers default to inactive so they cannot be accidentally launched.</p></div>
          {editingId && <button type="button" onClick={resetForm} className="text-sm font-medium text-slate-600 underline">Cancel edit</button>}
        </div>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium">Coupon code
            <input required maxLength={40} value={form.code} onChange={e => update("code", e.target.value.toUpperCase())} placeholder="WELCOME50" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 uppercase outline-none focus:border-[#D4AF37]" />
          </label>
          <label className="text-sm font-medium">Internal offer name
            <input required maxLength={100} value={form.name} onChange={e => update("name", e.target.value)} placeholder="First order offer" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 outline-none focus:border-[#D4AF37]" />
          </label>
          <label className="text-sm font-medium">Discount type
            <select value={form.discount_type} onChange={e => update("discount_type", e.target.value as PromotionInput["discount_type"])} className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5">
              <option value="FIXED">Fixed amount (₹)</option><option value="PERCENTAGE">Percentage (%)</option>
            </select>
          </label>
          <label className="text-sm font-medium">Discount value
            <input required type="number" min="0.01" step="0.01" max={form.discount_type === "PERCENTAGE" ? 100 : undefined} value={form.discount_value} onChange={e => update("discount_value", Number(e.target.value))} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">Minimum order (₹)
            <input required type="number" min="0" step="0.01" value={form.minimum_order_amount} onChange={e => update("minimum_order_amount", Number(e.target.value))} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">Maximum discount (₹, optional)
            <input type="number" min="0.01" step="0.01" value={form.maximum_discount_amount ?? ""} onChange={e => update("maximum_discount_amount", e.target.value === "" ? null : Number(e.target.value))} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">Total redemptions (blank = unlimited)
            <input type="number" min="1" step="1" value={form.usage_limit ?? ""} onChange={e => update("usage_limit", e.target.value === "" ? null : Number(e.target.value))} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">Uses per customer
            <input required type="number" min="1" step="1" value={form.per_customer_limit} onChange={e => update("per_customer_limit", Number(e.target.value))} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">Starts at (optional)
            <input type="datetime-local" value={form.starts_at ?? ""} onChange={e => update("starts_at", e.target.value)} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">Ends at (optional)
            <input type="datetime-local" value={form.ends_at ?? ""} onChange={e => update("ends_at", e.target.value)} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium sm:col-span-2 lg:col-span-3">Customer-facing description (optional)
            <textarea rows={2} value={form.description ?? ""} onChange={e => update("description", e.target.value)} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" />
          </label>
          <div className="flex flex-wrap gap-5 sm:col-span-2 lg:col-span-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.first_order_only} onChange={e => update("first_order_only", e.target.checked)} /> First order only</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={e => update("active", e.target.checked)} /> Active (available to use when checkout enforcement is enabled)</label>
          </div>
          <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-3">
            <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#071A35] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16} />{saving ? "Saving…" : editingId ? "Save changes" : "Create promotion"}</button>
            {!editingId && <button type="button" onClick={resetForm} className="rounded-xl border px-5 py-2.5 text-sm font-semibold">Reset</button>}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b p-5"><CalendarClock size={18} className="text-[#9b7b08]" /><h2 className="font-semibold">Saved promotions</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{promotions.length}</span></div>
        {loading ? <p className="p-6 text-sm text-slate-500">Loading promotions…</p> : promotions.length === 0 ? <div className="p-8 text-center"><BadgePercent className="mx-auto text-slate-300" size={30} /><p className="mt-2 font-medium">No promotions configured yet</p><p className="mt-1 text-sm text-slate-500">Create an offer above. It will remain inactive unless you enable it.</p></div> :
          <div className="divide-y">{promotions.map(p => <article key={p.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-[#071A35] px-2.5 py-1 font-mono text-sm font-bold tracking-wide text-[#D4AF37]">{p.code}</span><span className={p.active ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"}>{p.active ? "Active" : "Inactive"}</span>{p.first_order_only && <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800">First order only</span>}</div>
              <h3 className="mt-2 font-semibold text-slate-900">{p.name}</h3>
              {p.description && <p className="mt-1 text-sm text-slate-500">{p.description}</p>}
              <p className="mt-2 text-sm text-slate-600">{p.discount_type === "FIXED" ? money(Number(p.discount_value)) : `${p.discount_value}%`} off · Min. cart {money(Number(p.minimum_order_amount))}{p.maximum_discount_amount ? ` · Max discount ${money(Number(p.maximum_discount_amount))}` : ""}</p>
              <p className="mt-1 text-xs text-slate-400">Per customer: {p.per_customer_limit} · Total limit: {p.usage_limit ?? "Unlimited"}{p.starts_at ? ` · Starts ${new Date(p.starts_at).toLocaleString("en-IN")}` : ""}{p.ends_at ? ` · Ends ${new Date(p.ends_at).toLocaleString("en-IN")}` : ""}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2"><button onClick={() => edit(p)} className="rounded-lg border px-3 py-2 text-sm font-semibold">Edit</button><button onClick={() => void toggle(p)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold">{p.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}{p.active ? "Pause" : "Activate"}</button></div>
          </article>)}</div>}
      </section>
      <p className="text-xs leading-5 text-slate-500">Important: this page saves promotion configuration only. Coupon application, redemption counters and discount deduction must be wired into the server-side checkout/order-creation transaction before offers are advertised or activated for customers.</p>
    </main>
  );
}
