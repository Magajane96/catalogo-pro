"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

type OrderPayload = {
  order_number?: number;
  total?: number | string;
  customer_name?: string;
};

export function DashboardRealtime({ storeId }: { storeId?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!storeId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`dashboard-store-${storeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `store_id=eq.${storeId}` },
        payload => {
          const order = payload.new as OrderPayload;
          const orderLabel = order.order_number ? `#${order.order_number}` : "novo";
          const customer = order.customer_name ? ` de ${order.customer_name}` : "";
          const total = order.total ? ` - ${formatCurrency(order.total)}` : "";
          toast.success(`Pedido ${orderLabel}${customer}${total}`);
          router.refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activities", filter: `store_id=eq.${storeId}` },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router, storeId]);

  return null;
}
