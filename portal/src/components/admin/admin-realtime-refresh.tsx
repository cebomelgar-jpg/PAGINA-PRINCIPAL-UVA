"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/toast-provider";
import { formatOrderNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AdminRealtimeRefresh({
  label = "Sincronización en tiempo real",
}: {
  label?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const timeout = useRef<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (
          payload: RealtimePostgresChangesPayload<{ order_number?: number }>,
        ) => {
          if (payload.eventType === "INSERT") {
            const order = payload.new as { order_number?: number };
            toast({
              title: "Nuevo pedido recibido",
              description: order.order_number
                ? `Pedido ${formatOrderNumber(order.order_number)}`
                : "Actualizamos el panel.",
            });
          }

          if (timeout.current) window.clearTimeout(timeout.current);
          timeout.current = window.setTimeout(() => router.refresh(), 450);
        },
      )
      .subscribe((status: string) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      if (timeout.current) window.clearTimeout(timeout.current);
      supabase.removeChannel(channel);
    };
  }, [router, toast]);

  return (
    <span
      className={cn(
        "badge",
        connected
          ? "border-green/25 bg-mint/20 text-green-text"
          : "border-ink/10 bg-white/60 text-muted",
      )}
      title={
        connected
          ? "Los cambios de pedidos se reflejan automáticamente."
          : "Conectando con Supabase Realtime…"
      }
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          connected ? "bg-green animate-pulse-soft" : "bg-muted",
        )}
      />
      {connected ? label : "Conectando…"}
    </span>
  );
}
