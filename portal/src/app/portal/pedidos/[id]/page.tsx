import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Phone,
  ReceiptText,
  StickyNote,
} from "lucide-react";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/order-status-badge";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { PaymentInstructions } from "@/components/orders/payment-instructions";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { ProductImage } from "@/components/catalog/product-image";
import { requireProfile } from "@/lib/auth";
import { getPatientOrder } from "@/lib/data";
import { whatsappUrl } from "@/lib/config";
import {
  CATEGORY_LABELS,
  formatARS,
  formatDateTime,
  formatOrderNumber,
  FULFILLMENT_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/format";
import { z } from "zod";

export const metadata: Metadata = {
  title: "Detalle de pedido",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  if (!z.string().uuid().safeParse(id).success) {
    notFound();
  }

  const profile = await requireProfile();
  const order = await getPatientOrder(id, profile.id);

  if (!order) {
    notFound();
  }

  const itemCount = order.order_items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/portal/pedidos"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          Volver a mis pedidos
        </Link>
      </div>

      {query.created === "1" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-green/25 bg-mint/20 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-green text-white">
            <CheckCircle2 className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">
              Pedido recibido correctamente
            </p>
            <p className="mt-1 text-xs leading-relaxed text-green-text">
              El equipo va a revisar stock y pago. Si elegiste transferencia,
              abajo encontrás las instrucciones. También podemos escribirte por
              WhatsApp.
            </p>
          </div>
        </div>
      ) : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Pedido privado</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl text-ink sm:text-4xl">
              {formatOrderNumber(order.order_number)}
            </h1>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
          <p className="mt-2 text-sm text-muted">
            Creado el {formatDateTime(order.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.status === "pending" ? (
            <CancelOrderButton
              orderId={order.id}
              orderNumber={order.order_number}
            />
          ) : null}
          <a
            href={whatsappUrl(
              `Hola, quiero consultar por el pedido ${formatOrderNumber(order.order_number)} del portal.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="btn-outline btn-sm"
          >
            <MessageCircle className="size-3.5" />
            Consultar
          </a>
        </div>
      </header>

      <OrderTimeline status={order.status} />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-5">
          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Detalle</p>
                <h2 className="mt-1 text-2xl text-ink">
                  {itemCount} {itemCount === 1 ? "producto" : "productos"}
                </h2>
              </div>
              <ReceiptText className="size-5 text-green-text" />
            </div>

            <div className="mt-4 divide-y divide-ink/10">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex gap-3 py-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-ink/5">
                    <ProductImage
                      src={item.image_url}
                      alt={item.product_name}
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-green-text">
                      {item.category
                        ? CATEGORY_LABELS[item.category]
                        : "Producto"}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-ink">
                      {item.product_name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.quantity} × {formatARS(item.unit_price)}
                    </p>
                  </div>
                  <p className="self-center text-sm font-semibold text-ink">
                    {formatARS(item.line_total)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-2 space-y-2 border-t border-ink/10 pt-4 text-sm">
              <div className="flex items-center justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatARS(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Envío</span>
                <span>A coordinar</span>
              </div>
              <div className="flex items-end justify-between pt-2">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-2xl font-semibold text-ink">
                  {formatARS(order.total)}
                </span>
              </div>
            </div>
          </section>

          {order.therapeutic_notes || order.notes ? (
            <section className="card p-5 sm:p-6">
              <p className="eyebrow">Indicaciones</p>
              <h2 className="mt-1 text-2xl text-ink">
                Lo que compartiste con el equipo
              </h2>
              <div className="mt-4 space-y-3">
                {order.therapeutic_notes ? (
                  <div className="flex gap-3 rounded-2xl border border-purple/15 bg-purple/5 p-4">
                    <HeartPulse className="mt-0.5 size-4 shrink-0 text-purple" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple">
                        Necesidades terapéuticas
                      </p>
                      <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-ink/80">
                        {order.therapeutic_notes}
                      </p>
                    </div>
                  </div>
                ) : null}
                {order.notes ? (
                  <div className="flex gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4">
                    <StickyNote className="mt-0.5 size-4 shrink-0 text-muted" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                        Comentarios de entrega
                      </p>
                      <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-ink/80">
                        {order.notes}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted">
                <LockKeyhole className="size-3" />
                Esta información solo la ve el equipo que gestiona tu pedido.
              </p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          <PaymentInstructions
            paymentMethod={order.payment_method}
            paymentStatus={order.payment_status}
            total={order.total}
          />

          <section className="card p-5">
            <p className="eyebrow">Entrega</p>
            <h2 className="mt-1 text-xl text-ink">
              {FULFILLMENT_LABELS[order.fulfillment_method]}
            </h2>
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-muted">
              <div className="flex gap-2.5">
                <Phone className="mt-0.5 size-3.5 shrink-0 text-green-text" />
                <div>
                  <p className="font-semibold text-ink">Teléfono de contacto</p>
                  <p>{order.contact_phone}</p>
                </div>
              </div>
              {order.delivery_address ? (
                <div className="flex gap-2.5">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-green-text" />
                  <div>
                    <p className="font-semibold text-ink">Dirección</p>
                    <p>{order.delivery_address}</p>
                  </div>
                </div>
              ) : null}
              <div className="flex gap-2.5">
                <ReceiptText className="mt-0.5 size-3.5 shrink-0 text-green-text" />
                <div>
                  <p className="font-semibold text-ink">Pago</p>
                  <p>{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/50 p-4 text-[11px] leading-relaxed text-muted">
            <p className="font-semibold text-ink">¿Qué sigue?</p>
            <p className="mt-1">
              El equipo revisa el pedido, confirma stock y pago, y se comunica
              con vos para coordinar la entrega. Podés seguir el estado desde
              esta página.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
