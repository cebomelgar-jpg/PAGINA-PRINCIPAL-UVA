import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MessageCircle,
  Package,
  ReceiptText,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/order-status-badge";
import { ProductImage } from "@/components/catalog/product-image";
import { requireProfile } from "@/lib/auth";
import { getPatientOrders } from "@/lib/data";
import {
  formatARS,
  formatDate,
  formatOrderNumber,
  FULFILLMENT_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/format";
import { whatsappUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "Mis pedidos",
};

export default async function OrdersPage() {
  const profile = await requireProfile();
  const orders = await getPatientOrders(profile.id);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Historial privado"
        title="Mis pedidos"
        description="Seguí el estado de cada pedido, revisá el detalle y coordiná el pago o la entrega con el equipo."
        actions={
          <Link href="/portal/catalogo" className="btn-primary">
            <Package className="size-4" />
            Hacer un pedido
          </Link>
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={<ReceiptText className="size-6" />}
          title="Todavía no tenés pedidos"
          description="Cuando confirmes tu primer pedido, vas a poder seguir su estado y ver el detalle desde acá."
          action={
            <Link href="/portal/catalogo" className="btn-primary">
              Explorar catálogo
              <ArrowRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.order_items.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );
            return (
              <article
                key={order.id}
                className="card overflow-hidden p-0 transition hover:shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-white/40 px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-sm font-semibold text-ink">
                      {formatOrderNumber(order.order_number)}
                    </p>
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.payment_status} />
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <CalendarDays className="size-3.5" />
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex -space-x-2">
                      {order.order_items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="relative size-14 overflow-hidden rounded-2xl border-2 border-paper bg-ink/5"
                        >
                          <ProductImage
                            src={item.image_url}
                            alt={item.product_name}
                            sizes="56px"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {itemCount} {itemCount === 1 ? "producto" : "productos"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {order.order_items
                          .map((item) => item.product_name)
                          .join(" · ")}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        {PAYMENT_METHOD_LABELS[order.payment_method]} ·{" "}
                        {FULFILLMENT_LABELS[order.fulfillment_method]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-6 lg:items-center">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                        Total
                      </p>
                      <p className="text-lg font-semibold text-ink">
                        {formatARS(order.total)}
                      </p>
                    </div>
                    <Link
                      href={`/portal/pedidos/${order.id}`}
                      className="btn-outline btn-sm"
                    >
                      Ver detalle
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-ink/10 bg-white/50 p-4 text-xs text-muted sm:flex-row sm:items-center">
        <p>
          ¿Necesitás modificar un pedido pendiente? Escribinos antes de que el
          equipo lo confirme.
        </p>
        <a
          href={whatsappUrl("Hola, necesito consultar por un pedido del portal.")}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-green-text hover:underline"
        >
          <MessageCircle className="size-3.5" />
          Contactar al equipo
        </a>
      </div>
    </div>
  );
}
