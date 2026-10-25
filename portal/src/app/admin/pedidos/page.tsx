import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminRealtimeRefresh } from "@/components/admin/admin-realtime-refresh";
import { AdminOrdersTable } from "@/components/admin/admin-orders-table";
import { requireAdmin } from "@/lib/auth";
import { getAdminOrders } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pedidos",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operación"
        title="Pedidos"
        description="Planilla de despacho con edición de estado, pago y notas internas. Los pedidos nuevos aparecen automáticamente."
        actions={<AdminRealtimeRefresh />}
      />

      <AdminOrdersTable orders={orders} initialOrderId={params.pedido} />
    </div>
  );
}
