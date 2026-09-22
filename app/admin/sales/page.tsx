"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import SalesTable from "@/components/admin/sales/sales-table";

type SaleRow = {
  id: string;
  invoice_number: string;
  purchased_at: string;
  total_amount: number;
  payment_method: string | null;
  status: string | null;
  items: {
    product_name: string;
    category_name: string;
    quantity: number;
  }[];
};

export default function SalesPage() {
  return (
   <SalesTable />
  
  );
}