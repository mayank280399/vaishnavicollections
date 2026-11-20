import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type ExtractedRow = {
  date: string;
  product_name: string;
  quantity: number;
  amount: number;
  payment_method: string;
};

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function toIsoDate(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!match) return "";
  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = Number(match[3]);
  if (year < 100) year += 2000;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  return [year, String(month).padStart(2, "0"), String(day).padStart(2, "0")].join("-");
}

function normalizePayment(value: unknown): string {
  const method = String(value ?? "").trim().toLowerCase();
  if (["cash", "cash payment"].includes(method)) return "CASH";
  if (["upi", "gpay", "google pay", "phonepe", "paytm"].includes(method)) return "UPI";
  if (["card", "debit card", "credit card"].includes(method)) return "CARD";
  if (["bank transfer", "neft", "imps", "rtgs"].includes(method)) return "BANK_TRANSFER";
  if (["other", "unknown"].includes(method)) return "OTHER";
  return "";
}

function mapProduct(name: string, products: Array<{id:string;name:string;category_id:string|null}>, categories: Array<{id:string;name:string;parent_id:string|null}>) {
  const normalized = normalize(name);
  const exact = products.find((product) => normalize(product.name) === normalized);
  const selected = exact ?? null;
  const category = selected?.category_id
    ? categories.find((item) => item.id === selected.category_id) ?? null
    : null;
  const parent = category?.parent_id
    ? categories.find((item) => item.id === category.parent_id) ?? null
    : null;

  const suggestions = selected ? [] : products
    .map((product) => {
      const candidate = normalize(product.name);
      const score = candidate === normalized ? 1 : candidate.includes(normalized) || normalized.includes(candidate) ? 0.72 : 0;
      return { id: product.id, name: product.name, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    product_id: selected?.id ?? "",
    matched_product_name: selected?.name ?? "",
    category_id: parent?.id ?? category?.id ?? "",
    category_name: parent?.name ?? category?.name ?? "",
    subcategory_id: parent ? category?.id ?? "" : "",
    subcategory_name: parent ? category?.name ?? "" : "",
    match_status: selected ? "MATCHED" : "NEEDS_REVIEW",
    suggestions,
  };
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Please sign in again." }, { status: 401 }) };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!["ADMIN", "OWNER", "STAFF"].includes(String(profile?.role ?? "").toUpperCase())) {
    return { error: NextResponse.json({ error: "You do not have permission to import sales." }, { status: 403 }) };
  }
  return { supabase, user };
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a screenshot to upload." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Upload a JPG, PNG or WEBP screenshot." }, { status: 400 });
    if (file.size === 0 || file.size > MAX_IMAGE_SIZE) return NextResponse.json({ error: "Screenshot must be smaller than 10 MB." }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Screenshot extraction is not configured. Add OPENAI_API_KEY to the server environment." }, { status: 503 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const contentHash = createHash("sha256").update(bytes).digest("hex");
    const { data: duplicate } = await supabase.from("sales_image_imports").select("id,status").eq("content_hash", contentHash).maybeSingle();
    if (duplicate) {
      const message = duplicate.status === "IMPORTED"
        ? "This exact screenshot has already been imported."
        : "This screenshot already has an import draft. Open the existing draft or use a different screenshot.";
      return NextResponse.json({ error: message, duplicateImportId: duplicate.id, status: duplicate.status }, { status: 409 });
    }

    const mime = file.type;
    const dataUrl = `data:${mime};base64,${bytes.toString("base64")}`;
    const model = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Read sales rows from the provided screenshot. Return only JSON with an object containing rows. Each row must contain date, product_name, quantity, amount, payment_method. Do not infer missing values. Use YYYY-MM-DD dates when unambiguous; for DD/MM/YYYY interpret day first. Amount is the full line amount, not a unit price. Payment method must be CASH, UPI, CARD, BANK_TRANSFER, OTHER, or an empty string if unreadable. Ignore headings, totals, subtotals and non-sale notes. If a field is unclear, leave it empty or null."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract every individual sales row from this screenshot. The visible columns are Date, Product, Quantity, Amount and Mode of Payment. Return {\"rows\":[...]}. Do not combine rows." },
              { type: "image_url", image_url: { url: dataUrl, detail: "high" } }
            ]
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      const detail = await aiResponse.text();
      console.error("Sales screenshot AI error:", detail);
      return NextResponse.json({ error: "Could not read this screenshot. Try a clearer image." }, { status: 502 });
    }

    const aiPayload = await aiResponse.json();
    const rawContent = aiPayload.choices?.[0]?.message?.content;
    if (typeof rawContent !== "string") return NextResponse.json({ error: "The screenshot could not be interpreted. Try another image." }, { status: 502 });

    let parsed: { rows?: ExtractedRow[] };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return NextResponse.json({ error: "The screenshot reader returned invalid data. Please try again." }, { status: 502 });
    }

    const extracted = Array.isArray(parsed.rows) ? parsed.rows : [];
    if (!extracted.length) return NextResponse.json({ error: "No sales rows were found in this screenshot." }, { status: 422 });

    const [productResult, categoryResult] = await Promise.all([
      supabase.from("products").select("id,name,category_id,visibility").neq("visibility", "ARCHIVED").order("name"),
      supabase.from("product_categories").select("id,name,parent_id").eq("active", true).order("name")
    ]);
    if (productResult.error) throw new Error(productResult.error.message);
    if (categoryResult.error) throw new Error(categoryResult.error.message);

    const rows = extracted.map((row, index) => {
      const date = toIsoDate(row.date);
      const productName = String(row.product_name ?? "").trim();
      const quantity = Number(row.quantity);
      const amount = Number(row.amount);
      const paymentMethod = normalizePayment(row.payment_method);
      const match = mapProduct(productName, productResult.data ?? [], categoryResult.data ?? []);
      const issues: string[] = [];
      if (!date) issues.push("Check date");
      if (!productName) issues.push("Product name missing");
      if (!Number.isFinite(quantity) || quantity <= 0) issues.push("Check quantity");
      if (!Number.isFinite(amount) || amount < 0) issues.push("Check amount");
      if (!paymentMethod) issues.push("Select payment method");
      if (!match.product_id) issues.push("Match product");
      return {
        row_id: index + 1,
        date,
        product_name: productName,
        quantity: Number.isFinite(quantity) ? quantity : 0,
        amount: Number.isFinite(amount) ? amount : 0,
        payment_method: paymentMethod,
        ...match,
        issues,
      };
    });

    const storagePath = `${user.id}/${Date.now()}-${contentHash.slice(0, 12)}.${mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg"}`;
    const { error: uploadError } = await supabase.storage.from("sales-imports").upload(storagePath, bytes, { contentType: mime, upsert: false });
    if (uploadError) throw new Error(uploadError.message);

    const { data: importRecord, error: insertError } = await supabase
      .from("sales_image_imports")
      .insert({
        uploaded_by: user.id,
        image_path: storagePath,
        content_hash: contentHash,
        status: "REVIEW",
        extracted_rows: rows,
      })
      .select("id")
      .single();

    if (insertError || !importRecord) {
      await supabase.storage.from("sales-imports").remove([storagePath]);
      throw new Error(insertError?.message ?? "Could not save the import draft.");
    }

    const { data: signedImage } = await supabase.storage.from("sales-imports").createSignedUrl(storagePath, 60 * 60);
    return NextResponse.json({
      importId: importRecord.id,
      imageUrl: signedImage?.signedUrl ?? null,
      rows,
      products: (productResult.data ?? []).map(({ id, name, category_id }) => ({ id, name, category_id })),
      categories: categoryResult.data ?? [],
    });
  } catch (error) {
    console.error("Sales screenshot extraction failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to process screenshot." }, { status: 500 });
  }
}
