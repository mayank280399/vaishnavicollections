
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const RETURNS_PATH = "/admin/orders/returns";

type RefundMethod = "UPI" | "BANK_TRANSFER";

type InspectionItem = {
  id: string;
  approvedQuantity: number;
  receivedQuantity: number;
  restockQuantity: number;
};

type SaveInspectionInput = {
  returnRequestId: string;
  inspectionNotes: string;
  items: InspectionItem[];
};

function refreshReturns() {
  revalidatePath(RETURNS_PATH);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/orders/[id]", "page");
  revalidatePath("/account");
  revalidatePath("/orders");
}

async function getAuthorizedUser(allowedRoles: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Please sign in again.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    !allowedRoles.includes(String(profile.role).toUpperCase())
  ) {
    throw new Error("You do not have permission to perform this action.");
  }

  return { supabase, user };
}

function requireId(value: string, label: string) {
  if (!value?.trim()) {
    throw new Error(`${label} is required.`);
  }

  return value.trim();
}

function requireText(value: string, label: string) {
  if (!value?.trim()) {
    throw new Error(`${label} is required.`);
  }

  return value.trim();
}

/**
 * Moves a return request through the permitted return workflow.
 * Inventory restocking is handled atomically by the database RPC
 * when the request moves to INSPECTED.
 */
export async function updateReturnStatus(
  returnRequestId: string,
  nextStatus: string,
  staffNotes?: string,
) {
  const { supabase } = await getAuthorizedUser([
    "STAFF",
    "ADMIN",
    "OWNER",
  ]);

  const id = requireId(returnRequestId, "Return request ID");

  const allowedStatuses = [
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "RETURN_SHIPPED",
    "RECEIVED",
    "INSPECTED",
  ];

  if (!allowedStatuses.includes(nextStatus)) {
    throw new Error(
      "Unsupported return status. Refunds must use the refund workflow.",
    );
  }

  const { data, error } = await supabase.rpc(
    "update_return_request_status",
    {
      p_return_request_id: id,
      p_next_status: nextStatus,
      p_staff_notes: staffNotes?.trim() || null,
    },
  );

  if (error) {
    throw new Error(`Could not update return status: ${error.message}`);
  }

  refreshReturns();

  return {
    success: true,
    returnRequestId: data as string,
    status: nextStatus,
  };
}

/**
 * Saves all inspection quantities and notes in one database transaction.
 * The save_return_inspection RPC must be installed in Supabase.
 */
export async function saveReturnInspection(input: SaveInspectionInput) {
  const { supabase } = await getAuthorizedUser([
    "STAFF",
    "ADMIN",
    "OWNER",
  ]);

  const returnRequestId = requireId(
    input.returnRequestId,
    "Return request ID",
  );

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("At least one return item is required for inspection.");
  }

  const seenIds = new Set<string>();

  const items = input.items.map((item) => {
    const id = requireId(item.id, "Return item ID");

    if (seenIds.has(id)) {
      throw new Error("A return item was included more than once.");
    }

    seenIds.add(id);

    const approved = Number(item.approvedQuantity);
    const received = Number(item.receivedQuantity);
    const restock = Number(item.restockQuantity);

    if (
      !Number.isSafeInteger(approved) ||
      !Number.isSafeInteger(received) ||
      !Number.isSafeInteger(restock) ||
      approved < 0 ||
      received < 0 ||
      restock < 0
    ) {
      throw new Error("Inspection quantities must be non-negative integers.");
    }

    if (received > approved || restock > received) {
      throw new Error(
        "Check quantities: received cannot exceed approved, and restock cannot exceed received.",
      );
    }

    return {
      id,
      approved_quantity: approved,
      received_quantity: received,
      restock_quantity: restock,
    };
  });

  const { error } = await supabase.rpc("save_return_inspection", {
    p_return_request_id: returnRequestId,
    p_inspection_notes: input.inspectionNotes?.trim() || null,
    p_items: items,
  });

  if (error) {
    throw new Error(`Could not save return inspection: ${error.message}`);
  }

  refreshReturns();

  return {
    success: true,
    returnRequestId,
  };
}

/**
 * Creates a pending refund. This does not claim that money has
 * already been transferred.
 */
export async function createReturnRefund(input: {
  returnRequestId: string;
  amount: number;
  method: RefundMethod;
  internalNotes?: string;
}) {
  const { supabase } = await getAuthorizedUser(["ADMIN", "OWNER"]);

  const returnRequestId = requireId(
    input.returnRequestId,
    "Return request ID",
  );

  const amount = Number(input.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a refund amount greater than zero.");
  }

  if (Math.round(amount * 100) !== amount * 100) {
    throw new Error("Refund amounts cannot contain fractions of a paisa.");
  }

  if (!["UPI", "BANK_TRANSFER"].includes(input.method)) {
    throw new Error("Choose a supported refund method.");
  }

  const { data, error } = await supabase.rpc("create_return_refund", {
    p_return_request_id: returnRequestId,
    p_amount: Math.round(amount * 100) / 100,
    p_method: input.method,
    p_internal_notes: input.internalNotes?.trim() || null,
  });

  if (error) {
    throw new Error(`Could not create refund: ${error.message}`);
  }

  refreshReturns();

  return {
    success: true,
    refundId: data as string,
  };
}

/**
 * Completes a refund after the actual transfer has been made.
 * The payment reference is retained for reconciliation.
 */
export async function completeReturnRefund(input: {
  refundId: string;
  paymentReference: string;
  internalNotes?: string;
}) {
  const { supabase } = await getAuthorizedUser(["ADMIN", "OWNER"]);

  const refundId = requireId(input.refundId, "Refund ID");
  const paymentReference = requireText(
    input.paymentReference,
    "UPI transaction ID or bank transfer reference",
  );

  const { data, error } = await supabase.rpc("complete_return_refund", {
    p_refund_id: refundId,
    p_payment_reference: paymentReference,
    p_internal_notes: input.internalNotes?.trim() || null,
  });

  if (error) {
    throw new Error(`Could not complete refund: ${error.message}`);
  }

  refreshReturns();

  return {
    success: true,
    refundId: data as string,
  };
}
