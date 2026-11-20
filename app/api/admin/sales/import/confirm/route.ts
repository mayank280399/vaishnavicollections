import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ImportRow = {
  date: string;
  product_id: string;
  quantity: number;
  amount: number;
  payment_method: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!["ADMIN", "OWNER", "STAFF"].includes(String(profile?.role ?? "").toUpperCase())) {
    return NextResponse.json({ error: "You do not have permission to import sales." }, { status: 403 });
  }

  try {
    const body = await request.json() as { importId?: string; rows?: ImportRow[] };
    if (!body.importId || !Array.isArray(body.rows) || body.rows.length === 0) {
      return NextResponse.json({ error: "Import draft or sales rows are missing." }, { status: 400 });
    }
    if (body.rows.length > 500) return NextResponse.json({ error: "A screenshot can contain up to 500 sales rows." }, { status: 400 });

    const { data: customers, error: customerError } = await supabase
      .from("customers")
      .select("id,display_name")
      .order("display_name");
    if (customerError) throw new Error(customerError.message);

    let anonymousCustomer = (customers ?? []).find((customer) => /walk.?in|anonymous|guest/i.test(customer.display_name));
    if (!anonymousCustomer) {
      const { data: createdCustomer, error: createCustomerError } = await supabase
        .from("customers")
        .insert({
          customer_code: `ANON-${Date.now()}`,
          display_name: "Anonymous",
          source: "PHYSICAL_SHOP",
          total_orders: 0,
          total_spent: 0,
          lifetime_profit: 0,
          customer_segment: "NEW",
        })
        .select("id,display_name")
        .single();
      if (createCustomerError || !createdCustomer) {
        throw new Error(createCustomerError?.message ?? "Could not create the default Anonymous customer.");
      }
      anonymousCustomer = createdCustomer;
    }

    const validRows = body.rows.map((row) => ({
      date: String(row.date ?? ""),
      product_id: String(row.product_id ?? ""),
      quantity: Number(row.quantity),
      amount: Number(row.amount),
      payment_method: String(row.payment_method ?? "").toUpperCase(),
    }));

    for (const [index, row] of validRows.entries()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !row.product_id || !Number.isFinite(row.quantity) || row.quantity <= 0 || !Number.isFinite(row.amount) || row.amount < 0 || !["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"].includes(row.payment_method)) {
        return NextResponse.json({ error: `Entry ${index + 1} has invalid fields. Correct it before importing.` }, { status: 422 });
      }
    }

    const { data, error } = await supabase.rpc("import_sales_image_rows", {
      p_import_id: body.importId,
      p_customer_id: anonymousCustomer.id,
      p_rows: validRows,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/admin");
    revalidatePath("/admin/sales");
    revalidatePath("/admin/reports");
    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error("Sales screenshot import confirmation failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to import sales." }, { status: 500 });
  }
}
