import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

function xmlEscape(value: unknown): string {
  const text = value == null ? "" : value instanceof Date ? value.toISOString() : String(value);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cell(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
  }
  if (typeof value === "boolean") {
    return `<Cell><Data ss:Type="String">${value ? "Yes" : "No"}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

function worksheet(name: string, rows: Row[]): string {
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const safeKeys = keys.length ? keys : ["No records"];
  const header = `<Row>${safeKeys.map((key) => cell(key)).join("")}</Row>`;
  const body = rows.map((row) => `<Row>${safeKeys.map((key) => cell(row[key])).join("")}</Row>`).join("");
  return `<Worksheet ss:Name="${xmlEscape(name.slice(0, 31))}"><Table><Row>${safeKeys.map((key) => `<Cell><Data ss:Type="String">${xmlEscape(key)}</Data></Cell>`).join("")}</Row>${rows.map((row) => `<Row>${safeKeys.map((key) => cell(row[key])).join("")}</Row>`).join("")}</Table></Worksheet>`;
}

async function fetchAllPages<T>(buildQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {\n  const pageSize = 1000;\n  const all: T[] = [];\n  for (let offset = 0; ; offset += pageSize) {\n    const { data, error } = await buildQuery(offset, offset + pageSize - 1);\n    if (error) throw new Error(error.message);\n    const page = data ?? [];\n    all.push(...page);\n    if (page.length < pageSize) return all;\n  }\n}\n\nfunction normalizeRows(data: unknown[] | null): Row[] {
  return (data ?? []).map((item) => {
    const row = item && typeof item === "object" ? item as Row : { value: item };
    return Object.fromEntries(Object.entries(row).map(([key, value]) => [
      key,
      value !== null && typeof value === "object" ? JSON.stringify(value) : value,
    ]));
  });
}

function dateParam(value: string | null, fallback: string): string {
  const result = value ?? fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) throw new Error("Dates must use YYYY-MM-DD format.");
  const date = new Date(`${result}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== result) throw new Error("Invalid date.");
  return result;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Please sign in to export reports." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return NextResponse.json({ error: "Unable to verify your account permissions." }, { status: 500 });
  if (!profile?.role || !["ADMIN", "OWNER"].includes(String(profile.role).toUpperCase())) {
    return NextResponse.json({ error: "You do not have permission to export accounting reports." }, { status: 403 });
  }

  const now = new Date();
  const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const defaultTo = now.toISOString().slice(0, 10);
  let from: string;
  let to: string;
  try {
    from = dateParam(request.nextUrl.searchParams.get("from"), defaultFrom);
    to = dateParam(request.nextUrl.searchParams.get("to"), defaultTo);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid date range." }, { status: 400 });
  }
  if (from > to) return NextResponse.json({ error: "Start date must be on or before end date." }, { status: 400 });

  const start = `${from}T00:00:00+05:30`;
  const endExclusive = new Date(new Date(`${to}T00:00:00+05:30`).getTime() + 86400000).toISOString();

  try {
    const [sales, saleItemsAll, onlineOrders, purchases, purchaseItemsAll, expenses, returnRequests, refunds, returnItemsAll] = await Promise.all([
      fetchAllPages<Row>((fromRow, toRow) => supabase.from("sales").select("*").gte("purchased_at", start).lt("purchased_at", endExclusive).order("purchased_at", { ascending: true }).range(fromRow, toRow)),
      fetchAllPages<Row>((fromRow, toRow) => supabase.from("sale_items").select("*").range(fromRow, toRow)),
      fetchAllPages<Row>((fromRow, toRow) => supabase.from("orders").select("id,order_number,status,payment_status,payment_method,payment_plan,subtotal,shipping_amount,discount_amount,total_amount,amount_paid,amount_due,customer_name,customer_phone,shipping_address_line1,shipping_address_line2,shipping_city,shipping_state,shipping_postal_code,shipping_country,notes,created_at,updated_at,order_items(id,product_name,product_sku,quantity,unit_price,total_price)").gte("created_at", start).lt("created_at", endExclusive).order("created_at", { ascending: true }).range(fromRow, toRow)),
      fetchAllPages<Row>((fromRow, toRow) => supabase.from("purchases").select("*").gte("purchased_at", start).lt("purchased_at", endExclusive).order("purchased_at", { ascending: true }).range(fromRow, toRow)),
      fetchAllPages<Row>((fromRow, toRow) => supabase.from("purchase_items").select("*").range(fromRow, toRow)),
      fetchAllPages<Row>((fromRow, toRow) => supabase.from("expenses").select("*").gte("expense_date", from).lte("expense_date", to).order("expense_date", { ascending: true }).range(fromRow, toRow)),
      fetchAllPages<Row>((fromRow, toRow) => supabase.from("return_requests").select("*").gte("created_at", start).lt("created_at", endExclusive).order("created_at", { ascending: true }).range(fromRow, toRow)),
      fetchAllPages<Row>((fromRow, toRow) => supabase.from("refunds").select("*").gte("created_at", start).lt("created_at", endExclusive).order("created_at", { ascending: true }).range(fromRow, toRow)),
      fetchAllPages<Row>((fromRow, toRow) => supabase.from("return_request_items").select("*").range(fromRow, toRow)),
    ]);

    const saleIds = new Set(sales.map((row) => String(row.id)));
    const purchaseIds = new Set(purchases.map((row) => String(row.id)));
    const saleItems = saleItemsAll.filter((row) => saleIds.has(String(row.sale_id)));
    const purchaseItems = purchaseItemsAll.filter((row) => purchaseIds.has(String(row.purchase_id)));
    const returnRequestIds = new Set(returnRequests.map((row) => String(row.id)));
    const returnItems = returnItemsAll.filter((row) => returnRequestIds.has(String(row.return_request_id)));
    const orderItems = onlineOrders.flatMap((order) => {
      const items = Array.isArray(order.order_items) ? order.order_items as Row[] : [];
      return items.map((item) => ({ order_number: order.order_number, order_created_at: order.created_at, order_status: order.status, payment_status: order.payment_status, ...item }));
    });

    const sum = (rows: Row[], key: string) => rows.reduce((total, row) => total + (Number(row[key] ?? 0) || 0), 0);
    const summary: Row[] = [
      { Metric: "Reporting period", Value: `${from} to ${to}` },
      { Metric: "GST registration effective date", Value: "2026-10-26" },
      { Metric: "POS sales records (includes recorded statuses)", Value: sales.length },\n      { Metric: "Note on source records", Value: "POS sales and website orders are exported separately. Ask the CA to reconcile them and confirm whether the two sources overlap before calculating taxable turnover." },
      { Metric: "POS sales total_amount (not GST-calculated)", Value: Number(sum(sales, "total_amount").toFixed(2)) },
      { Metric: "Website orders", Value: onlineOrders.length },
      { Metric: "Website order total_amount (not GST-calculated)", Value: Number(sum(onlineOrders, "total_amount").toFixed(2)) },
      { Metric: "Purchases", Value: purchases.length },
      { Metric: "Purchase total_amount", Value: Number(sum(purchases, "total_amount").toFixed(2)) },
      { Metric: "Return requests", Value: returnRequests.length },\n      { Metric: "Refund records", Value: refunds.length },\n      { Metric: "Expenses", Value: expenses.length },
      { Metric: "Expense amount", Value: Number(sum(expenses, "amount").toFixed(2)) },
      { Metric: "Important", Value: "This workbook is a source-record export, not a filed GST return. GST rates, HSN, taxable value, CGST/SGST/IGST, credit eligibility, invoice treatment and adjustments must be checked by your CA. Do not treat totals as GST liability." },
    ];

    const sheets = [
      worksheet("Summary & Notes", summary),
      worksheet("POS Sales", normalizeRows(sales)),
      worksheet("POS Sale Items", normalizeRows(saleItems)),
      worksheet("Website Orders", normalizeRows(onlineOrders.map(({ order_items: _items, ...order }) => order))),
      worksheet("Website Order Items", normalizeRows(orderItems)),
      worksheet("Purchases", normalizeRows(purchases)),
      worksheet("Purchase Items", normalizeRows(purchaseItems)),
      worksheet("Expenses", normalizeRows(expenses)),
      worksheet("Return Requests", normalizeRows(returnRequests)),
      worksheet("Return Items", normalizeRows(returnItems)),
      worksheet("Refunds", normalizeRows(refunds)),
    ];
    const workbook = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">${sheets.join("")}</Workbook>`;
    const filename = `vaishnavi-collections-gst-source-report-${from}-to-${to}.xls`;
    return new NextResponse(workbook, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("GST export failed:", error);
    return NextResponse.json({ error: "Unable to generate the GST report right now." }, { status: 500 });
  }
}
