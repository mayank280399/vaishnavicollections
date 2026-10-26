"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Download, FileSpreadsheet, Info, Loader2, ShieldCheck } from "lucide-react";

function monthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}
function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function GstExportClient() {
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = useMemo(() => Boolean(from && to && from <= to), [from, to]);

  async function downloadReport() {
    if (!valid) {
      setError("Choose a valid date range. The start date must be on or before the end date.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/gst-export?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { method: "GET", cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Could not generate the Excel report.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vaishnavi-collections-gst-source-report-${from}-to-${to}.xls`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the report.");
    } finally {
      setLoading(false);
    }
  }

  function selectMonth(value: string) {
    if (!/^\d{4}-\d{2}$/.test(value)) return;
    const [year, month] = value.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    setFrom(`${value}-01`);
    const currentMonth = today().slice(0, 7);
    setTo(value === currentMonth ? today() : `${value}-${String(lastDay).padStart(2, "0")}`);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="rounded-2xl bg-brand-navy p-5 text-white sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-gold text-brand-navy">
            <FileSpreadsheet className="size-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Accounting & Compliance</p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">GST report for your CA</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Export a monthly Excel workbook with physical-shop sales, website orders, purchases, expenses and item-level records from your app.</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-brand-navy" />
          <h2 className="text-base font-semibold text-slate-900">Choose reporting period</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">Dates use India time for transaction timestamps. Download one workbook each month and send it securely to your CA.</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Quick select month
            <input type="month" defaultValue={today().slice(0, 7)} onChange={(event) => selectMonth(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
          </label>
          <div className="hidden sm:block" />
          <label className="block text-sm font-medium text-slate-700">
            From date
            <input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            To date
            <input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10" />
          </label>
        </div>

        {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <button type="button" onClick={downloadReport} disabled={!valid || loading} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#102b50] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-56">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {loading ? "Preparing Excel..." : "Download Excel report"}
        </button>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-900"><ShieldCheck className="size-5 text-brand-gold" /><h2 className="font-semibold">Included worksheets</h2></div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {["Summary & notes", "Physical shop / POS sales", "POS sale items", "Website orders & payment status", "Website order items", "Supplier purchases", "Purchase items", "Business expenses", "Return requests & items", "Refund records"].map((item) => <li key={item} className="flex items-start gap-2"><span className="mt-1 text-brand-gold">✓</span><span>{item}</span></li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2 text-amber-900"><Info className="mt-0.5 size-5 shrink-0" /><h2 className="font-semibold">Before sending to your CA</h2></div>
          <p className="mt-2 text-sm leading-6 text-amber-900/90">This is a source-data export, not a GST return. Your current records may not contain GSTINs, HSN codes, GST rates, taxable values or CGST/SGST/IGST separately. Ask your CA to verify these fields, tax treatment, ITC eligibility and return-period adjustments before filing.</p>
          <p className="mt-3 text-sm leading-6 text-amber-900/90">The workbook contains customer and supplier details. Share it only through a secure channel with your CA.</p>
        </div>
      </section>
    </div>
  );
}
