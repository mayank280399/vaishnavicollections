"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileImage, ImagePlus, Loader2, Plus, RefreshCw, Trash2, Upload } from "lucide-react";

type Product = { id: string; name: string; category_id: string | null };
type Category = { id: string; name: string; parent_id: string | null };
type Row = {
  row_id: number;
  date: string;
  product_name: string;
  product_id: string;
  matched_product_name: string;
  category_id: string;
  category_name: string;
  subcategory_id: string;
  subcategory_name: string;
  match_status: string;
  quantity: number;
  amount: number;
  payment_method: string;
  issues: string[];
};
type Extraction = { importId: string; imageUrl: string | null; rows: Row[]; products: Product[]; categories: Category[] };
type AmountType = "LINE_TOTAL" | "UNIT_PRICE";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "OTHER", label: "Other" },
];

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

function productCategory(product: Product | undefined, categories: Category[]) {
  if (!product?.category_id) return { category_id: "", category_name: "", subcategory_id: "", subcategory_name: "" };
  const assigned = categories.find((category) => category.id === product.category_id);
  if (!assigned) return { category_id: "", category_name: "", subcategory_id: "", subcategory_name: "" };
  const parent = assigned.parent_id ? categories.find((category) => category.id === assigned.parent_id) : null;
  return {
    category_id: parent?.id ?? assigned.id,
    category_name: parent?.name ?? assigned.name,
    subcategory_id: parent ? assigned.id : "",
    subcategory_name: parent ? assigned.name : "",
  };
}

export default function SalesScreenshotImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Extraction | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imported, setImported] = useState(false);
  const [amountType, setAmountType] = useState<AmountType>("LINE_TOTAL");

  const total = useMemo(() => data?.rows.reduce((sum, row) => sum + (Number(row.amount) || 0) * (amountType === "UNIT_PRICE" ? Number(row.quantity) || 0 : 1), 0) ?? 0, [data, amountType]);
  const issueCount = data?.rows.filter((row) => !row.date || !row.product_id || Number(row.quantity) <= 0 || !Number.isFinite(Number(row.amount)) || !row.payment_method).length ?? 0;

  function updateRow(index: number, patch: Partial<Row>) {
    setData((current) => current ? ({
      ...current,
      rows: current.rows.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        const next = { ...row, ...patch };
        if (patch.product_id !== undefined) {
          const product = current.products.find((item) => item.id === patch.product_id);
          const category = productCategory(product, current.categories);
          next.product_name = product?.name ?? "";
          next.matched_product_name = product?.name ?? "";
          next.match_status = product ? "MATCHED" : "NEEDS_REVIEW";
          Object.assign(next, category);
        }
        next.issues = [
          ...(!next.date ? ["Check date"] : []),
          ...(!next.product_id ? ["Match product"] : []),
          ...(Number(next.quantity) <= 0 ? ["Check quantity"] : []),
          ...(!Number.isFinite(Number(next.amount)) || Number(next.amount) < 0 ? ["Check amount"] : []),
          ...(!next.payment_method ? ["Select payment method"] : []),
        ];
        return next;
      }),
    }) : current);
  }

  async function extractScreenshot(selected: File) {
    setBusy(true); setError(""); setSuccess(""); setImported(false); setData(null);
    try {
      const form = new FormData();
      form.set("file", selected);
      const response = await fetch("/api/admin/sales/import/extract", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to read screenshot.");
      setData(payload as Extraction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to read screenshot.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(selected?: File) {
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Choose a JPG, PNG or WEBP screenshot.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("Screenshot must be smaller than 10 MB.");
      return;
    }
    setFile(selected);
    await extractScreenshot(selected);
  }

  async function confirmImport() {
    if (!data || issueCount > 0 || imported) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/admin/sales/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          importId: data.importId,
          rows: data.rows.map((row) => ({
            date: row.date,
            product_id: row.product_id,
            quantity: Number(row.quantity),
            amount: Number(row.amount),
            payment_method: row.payment_method,
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Import failed.");
      setImported(true);
      setSuccess(`Successfully imported ${payload.result.imported_count} sales entries totalling ${money(Number(payload.result.imported_total))}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to import sales.");
    } finally {
      setBusy(false);
    }
  }

  function addRow() {
    if (!data) return;
    setData({ ...data, rows: [...data.rows, {
      row_id: data.rows.length + 1, date: data.rows.at(-1)?.date ?? new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
      product_name: "", product_id: "", matched_product_name: "", category_id: "", category_name: "",
      subcategory_id: "", subcategory_name: "", match_status: "NEEDS_REVIEW", quantity: 1, amount: 0,
      payment_method: "", issues: ["Match product", "Select payment method"],
    }] });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/admin/sales" className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl border bg-white text-slate-600 hover:bg-slate-50" aria-label="Back to sales"><ArrowLeft className="size-4" /></Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Vaishnavi Collections</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Import sales screenshot</h1>
            <p className="mt-1 text-sm text-slate-500">Upload a sales screenshot, review every extracted entry, then import.</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"><FileImage className="size-3.5" /> Screenshot import</span>
      </div>

      {!data && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="font-semibold text-slate-900">Upload screenshot</h2>
            <p className="mt-1 text-sm text-slate-500">The reader looks for Date, Product, Quantity, Amount and Mode of Payment.</p>
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void handleFile(event.dataTransfer.files[0]); }} className="flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-amber-500 hover:bg-amber-50/40">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#071A35] text-[#D4AF37]"><ImagePlus className="size-7" /></span>
            <span className="mt-4 text-base font-semibold text-slate-900">Choose screenshot or drop it here</span>
            <span className="mt-1 text-sm text-slate-500">JPG, PNG or WEBP · Maximum 10 MB</span>
            <span className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#071A35] px-4 text-sm font-semibold text-white"><Upload className="size-4" /> Browse image</span>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
          {file && <p className="mt-3 text-xs text-slate-500">Selected: {file.name}</p>}
        </section>
      )}

      {busy && <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800"><Loader2 className="size-5 animate-spin" /> Reading screenshot / importing sales. Please keep this page open.</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 size-4 shrink-0" />{success}</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Summary label="Entries" value={String(data.rows.length)} />
            <Summary label="Needs attention" value={String(issueCount)} warn={issueCount > 0} />
            <Summary label="Total amount" value={money(total)} />
            <Summary label="Customer" value="Anonymous" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section className="min-w-0 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="font-semibold text-slate-900">Review and correct entries</h2><p className="text-xs text-slate-500">Tap any field to correct the extracted value. Product category is linked automatically.</p></div>
                <button type="button" onClick={addRow} disabled={imported} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Plus className="size-4" /> Add missing row</button>
              </div>

              {data.rows.map((row, index) => {
                const selectedProduct = data.products.find((product) => product.id === row.product_id);
                const category = productCategory(selectedProduct, data.categories);
                const subcategories = data.categories.filter((item) => item.parent_id === category.category_id);
                const hasIssues = !row.date || !row.product_id || Number(row.quantity) <= 0 || !Number.isFinite(Number(row.amount)) || !row.payment_method;
                return (
                  <article key={row.row_id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-lg bg-[#071A35] text-xs font-bold text-[#D4AF37]">{index + 1}</span><span className="text-sm font-semibold text-slate-800">Sales entry</span></div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${hasIssues ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>{hasIssues ? "Needs review" : "Ready"}</span>
                        <button type="button" disabled={imported} onClick={() => setData({ ...data, rows: data.rows.filter((_, i) => i !== index) })} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40" aria-label={`Remove entry ${index + 1}`}><Trash2 className="size-4" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Date"><input type="date" value={row.date} disabled={imported} onChange={(e) => updateRow(index, { date: e.target.value })} /></Field>
                      <Field label="Product"><select value={row.product_id} disabled={imported} onChange={(e) => updateRow(index, { product_id: e.target.value })}><option value="">Select matching product</option>{data.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></Field>
                      <Field label="Category"><input value={category.category_name || "Unmatched"} readOnly className="bg-slate-50 text-slate-500" /></Field>
                      <Field label="Subcategory"><input value={category.subcategory_name || "—"} readOnly className="bg-slate-50 text-slate-500" /></Field>
                      <Field label="Quantity"><input type="number" min="0.001" step="0.001" value={row.quantity} disabled={imported} onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })} /></Field>
                      <Field label={amountType === "LINE_TOTAL" ? "Amount (line total ₹)" : "Amount (per unit ₹)"}><input type="number" min="0" step="0.01" value={row.amount} disabled={imported} onChange={(e) => updateRow(index, { amount: Number(e.target.value) })} /></Field>
                      <Field label="Mode of payment"><select value={row.payment_method} disabled={imported} onChange={(e) => updateRow(index, { payment_method: e.target.value })}><option value="">Select payment mode</option>{PAYMENT_METHODS.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}</select></Field>
                      <Field label="Customer"><input value="Anonymous" readOnly className="bg-slate-50 text-slate-500" /></Field>
                    </div>
                    {row.issues.length > 0 && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Check: {row.issues.join(" · ")}</p>}
                    {row.product_id && <p className="mt-2 text-xs text-emerald-700">Product matched to catalogue: {selectedProduct?.name}{subcategories.length > 0 ? " · Category and subcategory linked" : " · Category linked"}</p>}
                  </article>
                );
              })}
            </section>

            <aside className="space-y-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold text-slate-900">Original screenshot</h3>
                {data.imageUrl ? <a href={data.imageUrl} target="_blank" rel="noreferrer" className="mt-3 block overflow-hidden rounded-xl border bg-slate-50">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={data.imageUrl} alt="Uploaded sales screenshot" className="h-auto max-h-[420px] w-full object-contain" /></a> : <p className="mt-3 text-sm text-slate-500">Original image saved privately.</p>}
                <p className="mt-2 text-xs text-slate-500">Use this to compare each extracted entry with the source.</p>
                <button type="button" onClick={() => { setData(null); setFile(null); setError(""); setSuccess(""); setImported(false); }} disabled={busy || imported} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className="size-4" /> Upload another screenshot</button>
              </section>
              <section className="rounded-2xl border border-[#071A35] bg-[#071A35] p-4 text-white shadow-sm">
                <p className="text-xs font-medium text-white/65">Import summary</p>
                <p className="mt-1 text-2xl font-bold text-[#D4AF37]">{money(total)}</p>
                <div className="mt-4 space-y-2 border-t border-white/15 pt-3 text-sm">
                  <div className="flex justify-between"><span className="text-white/65">Entries</span><strong>{data.rows.length}</strong></div>
                  <div className="flex justify-between"><span className="text-white/65">Needs correction</span><strong>{issueCount}</strong></div>
                  <div className="flex justify-between"><span className="text-white/65">Customer</span><strong>Anonymous</strong></div>
                </div>
                <button type="button" onClick={() => void confirmImport()} disabled={busy || imported || issueCount > 0 || data.rows.length === 0} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 text-sm font-bold text-[#071A35] hover:bg-[#e2c45c] disabled:cursor-not-allowed disabled:opacity-45">{busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}{imported ? "Imported" : issueCount ? "Correct entries to continue" : "Confirm and import sales"}</button>
                <p className="mt-2 text-[11px] leading-relaxed text-white/55">No sales are created until you confirm. Imported entries use the existing physical-shop sales flow.</p>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function Summary({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 truncate text-lg font-bold ${warn ? "text-amber-700" : "text-slate-900"}`}>{value}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block min-w-0 space-y-1.5"><span className="text-xs font-semibold text-slate-600">{label}</span><span className="block [&_input]:h-11 [&_input]:w-full [&_input]:min-w-0 [&_input]:rounded-xl [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:text-slate-900 [&_input]:outline-none [&_input]:focus:border-amber-500 [&_input]:focus:ring-2 [&_input]:focus:ring-amber-100 [&_select]:h-11 [&_select]:w-full [&_select]:min-w-0 [&_select]:rounded-xl [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:text-slate-900 [&_select]:outline-none [&_select]:focus:border-amber-500 [&_select]:focus:ring-2 [&_select]:focus:ring-amber-100 [&_input:disabled]:bg-slate-50 [&_select:disabled]:bg-slate-50">{children}</span></label>;
}
