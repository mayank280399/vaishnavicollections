
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ReturnsRefundsClient from "./returns-refunds-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AnyRow = Record<string, any>;

const EVIDENCE_BUCKET = "return-evidence";
const EVIDENCE_URL_EXPIRY_SECONDS = 60 * 60;

type QueryResult = {
  data: AnyRow[] | null;
  error: { message: string } | null;
};

export default async function ReturnsRefundsPage() {
  const supabase = await createClient();

  // Authenticate the current user.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verify the role on the server. Never rely only on client-side navigation.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return (
      <ErrorPanel>
        Could not verify your staff permissions. Please refresh the page or
        contact an administrator.
      </ErrorPanel>
    );
  }

  const role = String(profile?.role ?? "").toUpperCase();

  if (!["STAFF", "ADMIN", "OWNER"].includes(role)) {
    redirect("/");
  }

  // Load return requests first so related queries can use their IDs.
  const {
    data: requests,
    error: requestsError,
  } = await supabase
    .from("return_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (requestsError) {
    return (
      <ErrorPanel>
        Could not load return requests: {requestsError.message}
      </ErrorPanel>
    );
  }

  const rows = (requests ?? []) as AnyRow[];

  if (rows.length === 0) {
    return (
      <ReturnsRefundsClient
        initialRequests={[]}
        currentRole={role as "STAFF" | "ADMIN" | "OWNER"}
      />
    );
  }

  const orderIds = [
    ...new Set(
      rows
        .map((request) => request.order_id)
        .filter(
          (id): id is string =>
            typeof id === "string" && id.trim().length > 0,
        ),
    ),
  ];

  const userIds = [
    ...new Set(
      rows
        .map((request) => request.user_id)
        .filter(
          (id): id is string =>
            typeof id === "string" && id.trim().length > 0,
        ),
    ),
  ];

  const requestIds = [
    ...new Set(
      rows
        .map((request) => request.id)
        .filter(
          (id): id is string =>
            typeof id === "string" && id.trim().length > 0,
        ),
    ),
  ];

  // Load related records in parallel.
  // refunds.return_request_id references return_requests.id.
  const [
    ordersResult,
    profilesResult,
    returnItemsResult,
    refundsResult,
  ] = await Promise.all([
    orderIds.length
      ? supabase.from("orders").select("*").in("id", orderIds)
      : Promise.resolve({ data: [], error: null } as QueryResult),

    userIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name, phone, email")
          .in("id", userIds)
      : Promise.resolve({ data: [], error: null } as QueryResult),

    requestIds.length
      ? supabase
          .from("return_request_items")
          .select("*")
          .in("return_request_id", requestIds)
      : Promise.resolve({ data: [], error: null } as QueryResult),

    requestIds.length
      ? supabase
          .from("refunds")
          .select("*")
          .in("return_request_id", requestIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null } as QueryResult),
  ]);

  // Do not silently show incomplete return or refund data.
  const relatedQueryErrors = [
    ordersResult.error,
    profilesResult.error,
    returnItemsResult.error,
    refundsResult.error,
  ].filter(Boolean);

  if (relatedQueryErrors.length > 0) {
    const firstError = relatedQueryErrors[0];

    return (
      <ErrorPanel>
        Could not load all return details
        {firstError?.message ? `: ${firstError.message}` : "."} Check the
        Supabase permissions and try again.
      </ErrorPanel>
    );
  }

  const orders = (ordersResult.data ?? []) as AnyRow[];
  const customers = (profilesResult.data ?? []) as AnyRow[];
  const returnItems = (returnItemsResult.data ?? []) as AnyRow[];
  const refunds = (refundsResult.data ?? []) as AnyRow[];

  // Load the original order items associated with the return requests.
  const orderItemIds = [
    ...new Set(
      returnItems
        .map((item) => item.order_item_id)
        .filter(
          (id): id is string =>
            typeof id === "string" && id.trim().length > 0,
        ),
    ),
  ];

  const orderItemsResult = orderItemIds.length
    ? await supabase.from("order_items").select("*").in("id", orderItemIds)
    : { data: [], error: null } as QueryResult;

  if (orderItemsResult.error) {
    return (
      <ErrorPanel>
        Could not load the original order items:{" "}
        {orderItemsResult.error.message}
      </ErrorPanel>
    );
  }

  const orderItems = (orderItemsResult.data ?? []) as AnyRow[];

  // Index orders and customers.
  const orderById = new Map<string, AnyRow>(
    orders.map((order) => [order.id, order]),
  );

  const customerById = new Map<string, AnyRow>(
    customers.map((customer) => [customer.id, customer]),
  );

  const orderItemById = new Map<string, AnyRow>(
    orderItems.map((item) => [item.id, item]),
  );

  // Map each return request to its order.
  const orderIdByRequestId = new Map<string, string>();

  for (const request of rows) {
    if (
      typeof request.id === "string" &&
      typeof request.order_id === "string"
    ) {
      orderIdByRequestId.set(request.id, request.order_id);
    }
  }

  // Group return items by request and attach the original order item.
  const itemsByRequestId = new Map<string, AnyRow[]>();

  for (const item of returnItems) {
    const requestId = item.return_request_id as string;
    const existing = itemsByRequestId.get(requestId) ?? [];

    existing.push({
      ...item,
      order_item: orderItemById.get(item.order_item_id) ?? null,
    });

    itemsByRequestId.set(requestId, existing);
  }

  // Preserve each request's own refund history.
  const refundsByRequestId = new Map<string, AnyRow[]>();

  // Also aggregate refunds across every return request for each order.
  // This lets the client calculate a shared order-wide refund balance.
  const refundsByOrderId = new Map<string, AnyRow[]>();

  for (const refund of refunds) {
    const requestId = refund.return_request_id as string;

    const requestRefunds = refundsByRequestId.get(requestId) ?? [];
    requestRefunds.push(refund);
    refundsByRequestId.set(requestId, requestRefunds);

    const orderId = orderIdByRequestId.get(requestId);

    if (orderId) {
      const orderRefunds = refundsByOrderId.get(orderId) ?? [];
      orderRefunds.push(refund);
      refundsByOrderId.set(orderId, orderRefunds);
    }
  }

  // Sign private evidence URLs only after authorizing the staff member.
  const evidencePaths = [
    ...new Set(
      rows
        .map((request) => request.evidence_storage_path)
        .filter(
          (path): path is string =>
            typeof path === "string" && path.trim().length > 0,
        ),
    ),
  ];

  // Use the server-only service client after the staff role check above.
  // The evidence bucket is private and storage RLS may allow uploaders only;
  // staff must still be able to review videos without making the bucket public.
  const storageAdmin = createAdminClient();

  const evidenceEntries = await Promise.all(
    evidencePaths.map(async (path) => {
      const { data, error } = await storageAdmin.storage
        .from(EVIDENCE_BUCKET)
        .createSignedUrl(path, EVIDENCE_URL_EXPIRY_SECONDS);

      if (error) {
        // One missing evidence file should not break the entire page.
        console.error("Could not sign return evidence URL:", {
          path,
          message: error.message,
        });

        return [path, null] as const;
      }

      return [path, data?.signedUrl ?? null] as const;
    }),
  );

  const evidenceByPath = new Map<string, string | null>(evidenceEntries);

  // Assemble the shape expected by returns-refunds-client.tsx.
  const initialRequests: AnyRow[] = rows.map((request) => {
    const orderId = request.order_id as string | undefined;

    return {
      ...request,

      order: orderById.get(request.order_id) ?? null,

      customer: customerById.get(request.user_id) ?? null,

      evidence_url: request.evidence_storage_path
        ? evidenceByPath.get(request.evidence_storage_path) ?? null
        : null,

      items: itemsByRequestId.get(request.id) ?? [],

      // Refunds belonging to this specific return request.
      refunds: refundsByRequestId.get(request.id) ?? [],

      // Refunds belonging to ALL return requests for the same order.
      // Use this list for the order-wide refundable balance.
      order_refunds: orderId
        ? refundsByOrderId.get(orderId) ?? []
        : [],
    };
  });

  return (
    <ReturnsRefundsClient
      initialRequests={initialRequests}
      currentRole={role as "STAFF" | "ADMIN" | "OWNER"}
    />
  );
}

function ErrorPanel({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm leading-6 text-red-800"
    >
      {children}
    </div>
  );
}
