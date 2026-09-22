"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/* =========================================================
   TYPES
========================================================= */

type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "BANK_TRANSFER"
  | "OTHER";

/* =========================================================
   SALE
========================================================= */

/**
 * Create a new sale.
 *
 * Database operation:
 *   sales
 *   sale_items
 *
 * The actual multi-table insert is handled by the
 * create_sale PostgreSQL RPC.
 */
export async function createSale(input: {
  customerId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  paymentMethod: PaymentMethod;
  purchasedAt: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "create_sale",
    {
      p_customer_id: input.customerId,
      p_product_id: input.productId,
      p_variant_id:
        input.variantId || null,
      p_quantity: input.quantity,
      p_unit_price: input.unitPrice,
      p_discount: input.discount,
      p_payment_method:
        input.paymentMethod,
      p_purchased_at:
        input.purchasedAt,
    }
  );

  if (error) {
    throw new Error(
      `Failed to create sale: ${error.message}`
    );
  }

  revalidatePath("/admin");

  return data;
}

/**
 * Update an existing sale.
 */
export async function updateSale(input: {
  saleId: string;
  customerId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  paymentMethod: PaymentMethod;
  purchasedAt: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "update_sale",
    {
      p_sale_id: input.saleId,
      p_customer_id: input.customerId,
      p_product_id: input.productId,
      p_variant_id:
        input.variantId || null,
      p_quantity: input.quantity,
      p_unit_price: input.unitPrice,
      p_discount: input.discount,
      p_payment_method:
        input.paymentMethod,
      p_purchased_at:
        input.purchasedAt,
    }
  );

  if (error) {
    throw new Error(
      `Failed to update sale: ${error.message}`
    );
  }

  revalidatePath("/admin");

  return data;
}

/**
 * Delete an existing sale.
 */
export async function deleteSale(
  saleId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "delete_sale",
    {
      p_sale_id: saleId,
    }
  );

  if (error) {
    throw new Error(
      `Failed to delete sale: ${error.message}`
    );
  }

  revalidatePath("/admin");

  return data;
}

/* =========================================================
   EXPENSE
========================================================= */

/**
 * Create a new expense.
 */
export async function createExpense(input: {
  expenseDate: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "create_expense",
    {
      p_expense_date:
        input.expenseDate,
      p_category:
        input.category,
      p_subcategory:
        input.subcategory || null,
      p_description:
        input.description,
      p_amount:
        input.amount,
      p_payment_method:
        input.paymentMethod,
      p_notes:
        input.notes || null,
    }
  );

  if (error) {
    throw new Error(
      `Failed to create expense: ${error.message}`
    );
  }

  revalidatePath("/admin");

  return data;
}

/**
 * Update an existing expense.
 */
export async function updateExpense(input: {
  expenseId: string;
  expenseDate: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "update_expense",
    {
      p_expense_id:
        input.expenseId,
      p_expense_date:
        input.expenseDate,
      p_category:
        input.category,
      p_subcategory:
        input.subcategory || null,
      p_description:
        input.description,
      p_amount:
        input.amount,
      p_payment_method:
        input.paymentMethod,
      p_notes:
        input.notes || null,
    }
  );

  if (error) {
    throw new Error(
      `Failed to update expense: ${error.message}`
    );
  }

  revalidatePath("/admin");

  return data;
}

/**
 * Delete an existing expense.
 */
export async function deleteExpense(
  expenseId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "delete_expense",
    {
      p_expense_id: expenseId,
    }
  );

  if (error) {
    throw new Error(
      `Failed to delete expense: ${error.message}`
    );
  }

  revalidatePath("/admin");

  return data;
}

/* =========================================================
   PURCHASE
========================================================= */

/**
 * Create a new purchase.
 *
 * Database operation:
 *   purchases
 *   purchase_items
 */
export async function createPurchase(input: {
  supplierName?: string;
  invoiceNumber?: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitCost: number;
  discount: number;
  paymentMethod: PaymentMethod;
  purchasedAt: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "create_purchase",
    {
      p_supplier_name:
        input.supplierName || null,
      p_invoice_number:
        input.invoiceNumber || null,
      p_product_id:
        input.productId,
      p_variant_id:
        input.variantId || null,
      p_quantity:
        input.quantity,
      p_unit_cost:
        input.unitCost,
      p_discount:
        input.discount,
      p_payment_method:
        input.paymentMethod,
      p_purchased_at:
        input.purchasedAt,
    }
  );

  if (error) {
    throw new Error(
      `Failed to create purchase: ${error.message}`
    );
  }

  revalidatePath("/admin");

  return data;
}

/**
 * Update an existing purchase.
 */
export async function updatePurchase(input: {
  purchaseId: string;
  supplierName?: string;
  invoiceNumber?: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitCost: number;
  discount: number;
  paymentMethod: PaymentMethod;
  purchasedAt: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "update_purchase",
    {
      p_purchase_id:
        input.purchaseId,
      p_supplier_name:
        input.supplierName || null,
      p_invoice_number:
        input.invoiceNumber || null,
      p_product_id:
        input.productId,
      p_variant_id:
        input.variantId || null,
      p_quantity:
        input.quantity,
      p_unit_cost:
        input.unitCost,
      p_discount:
        input.discount,
      p_payment_method:
        input.paymentMethod,
      p_purchased_at:
        input.purchasedAt,
    }
  );

  if (error) {
    throw new Error(
      `Failed to update purchase: ${error.message}`
    );
  }

  revalidatePath("/admin");

  return data;
}

/**
 * Delete an existing purchase.
 */
export async function deletePurchase(
  purchaseId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "delete_purchase",
    {
      p_purchase_id: purchaseId,
    }
  );

  if (error) {
    throw new Error(
      `Failed to delete purchase: ${error.message}`
    );
  }

  revalidatePath("/admin");

  return data;
}