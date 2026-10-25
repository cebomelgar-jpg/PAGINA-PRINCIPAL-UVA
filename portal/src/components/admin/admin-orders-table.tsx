"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  Download,
  Eye,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  ReceiptText,
  Save,
  Search,
  StickyNote,
  X,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/order-status-badge";
import { ProductImage } from "@/components/catalog/product-image";
import { useToast } from "@/components/providers/toast-provider";
import {
  saveOrderNotesAction,
  updateOrderStatusAction,
} from "@/lib/actions/orders";
import { whatsappUrl } from "@/lib/config";
import {
  CATEGORY_LABELS,
  formatARS,
  formatDateTime,
  formatOrderNumber,
  FULFILLMENT_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
} from "@/lib/format";
import type { AdminOrder, OrderStatus, PaymentStatus } from "@/lib/types";
import { cn, normalizeSearch } from "@/lib/utils";

type Filter = "todos" | OrderStatus;

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "todos", label: "Todos" },
  ...(
    ["pending", "confirmed", "preparing", "delivered", "cancelled"] as OrderStatus[]
  ).map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status] })),
];

export function AdminOrdersTable({
  orders,
  initialOrderId,
}: {
  orders: AdminOrder[];
  initialOrderId?: string;
}) {
  const [filter, setFilter] = useState<Filter>("todos");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (initialOrderId && orders.some((order) => order.id === initialOrderId)) {
      return initialOrderId;
    }
    return null;
  });

  const counts = useMemo(() => {
    const result: Record<Filter, number> = {
      todos: orders.length,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const order of orders) result[order.status] += 1;
    return result;
  }, [orders]);

  const filtered = useMemo(() => {
    const term = normalizeSearch(search);
    return orders.filter((order) => {
      if (filter !== "todos" && order.status !== filter) return false;
      if (!term) return true;
      const haystack = [
        String(order.order_number),
        order.patient_name,
        order.patient_email ?? "",
        order.contact_phone,
        order.delivery_address ?? "",
        order.notes ?? "",
        order.therapeutic_notes ?? "",
        order.profile?.full_name ?? "",
        ...order.items.map((item) => item.product_name),
      ]
        .join(" ")
        .toLowerCase();
      return normalizeSearch(haystack).includes(term);
    });
  }, [orders, filter, search]);

  const selected = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? null,
    [orders, selectedId],
  );

  function exportCsv() {
    const headers = [
      "Pedido",
      "Fecha",
      "Paciente",
      "Email",
      "Teléfono",
      "Estado",
      "Pago",
      "Método de pago",
      "Entrega",
      "Dirección",
      "Productos",
      "Total",
      "Notas",
      "Notas internas",
    ];
    const rows = filtered.map((order) => [
      formatOrderNumber(order.order_number),
      formatDateTime(order.created_at),
      order.patient_name,
      order.patient_email ?? "",
      order.contact_phone,
      ORDER_STATUS_LABELS[order.status],
      PAYMENT_STATUS_LABELS[order.payment_status],
      PAYMENT_METHOD_LABELS[order.payment_method],
      FULFILLMENT_LABELS[order.fulfillment_method],
      order.delivery_address ?? "",
      order.items
        .map((item) => `${item.quantity}× ${item.product_name}`)
        .join(" | "),
      String(order.total),
      order.notes ?? "",
      order.admin_notes ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(";"),
      )
      .join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pedidos-uva-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="no-print card flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="hide-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 py-1">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                  filter === item.value
                    ? "bg-ink text-paper shadow-card"
                    : "text-muted hover:bg-ink/5 hover:text-ink",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px]",
                    filter === item.value ? "bg-mint text-deep" : "bg-ink/10",
                  )}
                >
                  {counts[item.value]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar pedido, paciente o producto"
                className="input h-9 py-2 pl-9 pr-8 text-xs"
                aria-label="Buscar pedidos"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-ink"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="btn-outline btn-sm"
            >
              <Download className="size-3.5" />
              CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-outline btn-sm"
            >
              <Printer className="size-3.5" />
              Imprimir
            </button>
          </div>
        </div>
        <p className="text-[11px] text-muted">
          {filtered.length} de {orders.length} pedidos. Los cambios de estado se
          guardan al instante. La planilla se actualiza sola cuando entra un
          pedido nuevo.
        </p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Paciente</th>
              <th>Productos</th>
              <th>Entrega</th>
              <th>Total</th>
              <th>Pago</th>
              <th>Estado</th>
              <th>Notas</th>
              <th className="no-print">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onOpen={() => setSelectedId(order.id)}
              />
            ))}
          </tbody>
        </table>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">
            No hay pedidos que coincidan con el filtro.
          </div>
        ) : null}
      </div>

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={
          selected
            ? `Pedido ${formatOrderNumber(selected.order_number)}`
            : "Pedido"
        }
        description={
          selected ? `${selected.patient_name} · ${formatDateTime(selected.created_at)}` : undefined
        }
        size="xl"
      >
        {selected ? (
          <AdminOrderDetail key={selected.id} order={selected} />
        ) : null}
      </Dialog>
    </div>
  );
}

function OrderRow({
  order,
  onOpen,
}: {
  order: AdminOrder;
  onOpen: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    order.payment_status,
  );
  const [saving, setSaving] = useState(false);
  const locked = order.status === "cancelled";

  useEffect(() => {
    setStatus(order.status);
    setPaymentStatus(order.payment_status);
  }, [order.status, order.payment_status]);

  async function updateStatus(
    nextStatus: OrderStatus,
    nextPaymentStatus: PaymentStatus,
  ) {
    setSaving(true);
    const previousStatus = status;
    const previousPayment = paymentStatus;
    setStatus(nextStatus);
    setPaymentStatus(nextPaymentStatus);

    const result = await updateOrderStatusAction({
      orderId: order.id,
      status: nextStatus,
      paymentStatus: nextPaymentStatus,
    });

    if (!result.ok) {
      setStatus(previousStatus);
      setPaymentStatus(previousPayment);
      toast({
        title: "No pudimos actualizar el pedido",
        description: result.error,
        variant: "error",
      });
      setSaving(false);
      return;
    }

    toast({
      title: "Pedido actualizado",
      description: `${formatOrderNumber(order.order_number)} · ${ORDER_STATUS_LABELS[nextStatus]}`,
    });
    router.refresh();
    setSaving(false);
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const productSummary = order.items
    .slice(0, 2)
    .map((item) => `${item.quantity}× ${item.product_name}`)
    .join(" · ");
  const remaining = Math.max(0, order.items.length - 2);

  return (
    <tr>
      <td>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="text-left text-xs font-semibold text-ink hover:text-green-text hover:underline"
          >
            {formatOrderNumber(order.order_number)}
          </button>
          {saving ? <Loader2 className="size-3 animate-spin text-muted" /> : null}
        </div>
        <p className="mt-0.5 whitespace-nowrap text-[10px] text-muted">
          {formatDateTime(order.created_at)}
        </p>
      </td>
      <td>
        <p className="max-w-36 truncate text-xs font-semibold text-ink">
          {order.patient_name}
        </p>
        <a
          href={`tel:${order.contact_phone}`}
          className="mt-0.5 flex items-center gap-1 text-[10px] text-muted hover:text-green-text"
        >
          <Phone className="size-2.5" />
          {order.contact_phone}
        </a>
      </td>
      <td>
        <p className="max-w-48 truncate text-[11px] text-ink">
          {productSummary || "Sin productos"}
        </p>
        <p className="mt-0.5 text-[10px] text-muted">
          {itemCount} {itemCount === 1 ? "unidad" : "unidades"}
          {remaining > 0 ? ` · +${remaining} más` : ""}
        </p>
        <p className="mt-0.5 text-[10px] text-muted">
          {PAYMENT_METHOD_LABELS[order.payment_method]}
        </p>
      </td>
      <td>
        <p className="text-[11px] text-ink">
          {FULFILLMENT_LABELS[order.fulfillment_method]}
        </p>
        {order.delivery_address ? (
          <p className="mt-0.5 flex max-w-40 items-start gap-1 text-[10px] text-muted">
            <MapPin className="mt-0.5 size-2.5 shrink-0" />
            <span className="line-clamp-2">{order.delivery_address}</span>
          </p>
        ) : null}
      </td>
      <td>
        <p className="whitespace-nowrap text-xs font-semibold text-ink">
          {formatARS(order.total)}
        </p>
        <p className="mt-0.5 text-[10px] text-muted">
          {PAYMENT_STATUS_LABELS[order.payment_status]}
        </p>
      </td>
      <td>
        <select
          aria-label={`Estado de pago del pedido ${order.order_number}`}
          value={paymentStatus}
          disabled={saving || locked}
          onChange={(event) =>
            updateStatus(status, event.target.value as PaymentStatus)
          }
          className={cn(
            "max-w-32 rounded-lg border px-2 py-1.5 text-[10px] font-semibold outline-none transition disabled:opacity-60",
            PAYMENT_STATUS_STYLES[paymentStatus],
          )}
        >
          {(["pending", "paid", "cancelled"] as PaymentStatus[]).map((value) => (
            <option key={value} value={value}>
              {PAYMENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </td>
      <td>
        <select
          aria-label={`Estado del pedido ${order.order_number}`}
          value={status}
          disabled={saving || locked}
          onChange={(event) =>
            updateStatus(event.target.value as OrderStatus, paymentStatus)
          }
          className={cn(
            "max-w-36 rounded-lg border px-2 py-1.5 text-[10px] font-semibold outline-none transition disabled:opacity-60",
            ORDER_STATUS_STYLES[status],
          )}
        >
          {(
            ["pending", "confirmed", "preparing", "delivered", "cancelled"] as OrderStatus[]
          ).map((value) => (
            <option key={value} value={value}>
              {ORDER_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </td>
      <td>
        {order.admin_notes ? (
          <p className="max-w-36 line-clamp-2 text-[10px] text-muted">
            {order.admin_notes}
          </p>
        ) : order.therapeutic_notes ? (
          <p className="flex items-center gap-1 text-[10px] text-purple">
            <StickyNote className="size-3" />
            Con indicaciones
          </p>
        ) : (
          <span className="text-[10px] text-muted/50">—</span>
        )}
      </td>
      <td className="no-print">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpen}
            className="rounded-lg p-1.5 text-muted transition hover:bg-ink/5 hover:text-ink"
            aria-label={`Ver pedido ${order.order_number}`}
          >
            <Eye className="size-3.5" />
          </button>
          <a
            href={whatsappUrl(
              `Hola ${order.patient_name}, te escribimos por tu pedido ${formatOrderNumber(order.order_number)} de Un Viaje Astral.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg p-1.5 text-muted transition hover:bg-mint/20 hover:text-green-text"
            aria-label={`Escribir a ${order.patient_name}`}
          >
            <MessageCircle className="size-3.5" />
          </a>
        </div>
      </td>
    </tr>
  );
}

function AdminOrderDetail({ order }: { order: AdminOrder }) {
  const router = useRouter();
  const { toast } = useToast();
  const [notes, setNotes] = useState(order.admin_notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function saveNotes() {
    setError(null);
    setSavingNotes(true);
    const result = await saveOrderNotesAction({
      orderId: order.id,
      adminNotes: notes,
    });
    setSavingNotes(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast({ title: "Nota guardada", description: "La nota interna se actualizó." });
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.payment_status} />
        <span className="chip">{FULFILLMENT_LABELS[order.fulfillment_method]}</span>
        <span className="chip">{PAYMENT_METHOD_LABELS[order.payment_method]}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoBlock label="Paciente" value={order.patient_name} />
        <InfoBlock label="Teléfono" value={order.contact_phone} />
        <InfoBlock label="Email" value={order.patient_email ?? "—"} />
        <InfoBlock label="Total" value={formatARS(order.total)} />
        <InfoBlock
          label="Entrega"
          value={order.delivery_address || "Retiro en sede"}
        />
        <InfoBlock
          label="Creado"
          value={formatDateTime(order.created_at)}
        />
        <InfoBlock label="Actualizado" value={formatDateTime(order.updated_at)} />
        <InfoBlock
          label="Productos"
          value={`${order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades`}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink/10">
        <table className="w-full text-left text-xs">
          <thead className="bg-ink/[0.04] text-[10px] uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-3 py-2 font-semibold">Producto</th>
              <th className="px-3 py-2 font-semibold">Cantidad</th>
              <th className="px-3 py-2 font-semibold">Unitario</th>
              <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t border-ink/10">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="relative size-8 overflow-hidden rounded-lg bg-ink/5">
                      <ProductImage
                        src={item.image_url}
                        alt={item.product_name}
                        sizes="32px"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{item.product_name}</p>
                      <p className="text-[10px] text-muted">
                        {item.category ? CATEGORY_LABELS[item.category] : "Producto"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-muted">{item.quantity}</td>
                <td className="px-3 py-2 text-muted">
                  {formatARS(item.unit_price)}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-ink">
                  {formatARS(item.line_total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-ink/10 bg-ink/[0.02]">
              <td colSpan={3} className="px-3 py-2 text-right text-xs font-semibold text-ink">
                Total
              </td>
              <td className="px-3 py-2 text-right text-sm font-semibold text-ink">
                {formatARS(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-purple/15 bg-purple/5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple">
            Necesidades terapéuticas
          </p>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-ink/80">
            {order.therapeutic_notes || "Sin indicaciones del paciente."}
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Comentarios de entrega
          </p>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-ink/80">
            {order.notes || "Sin comentarios."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
        <label htmlFor="adminNotes" className="label">
          Nota interna
        </label>
        <textarea
          id="adminNotes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="textarea min-h-24"
          placeholder="Ej. pagó por transferencia, coordinar entrega el viernes…"
          maxLength={2000}
          rows={3}
        />
        {error ? (
          <p className="field-error flex items-center gap-1">
            <AlertCircle className="size-3.5" />
            {error}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] text-muted">
            Esta nota solo la ve el equipo administrativo.
          </p>
          <button
            type="button"
            onClick={saveNotes}
            disabled={savingNotes}
            className="btn-primary btn-sm"
          >
            {savingNotes ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                Guardar nota
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-ink/10 pt-4">
        <a
          href={whatsappUrl(
            `Hola ${order.patient_name}, te escribimos por tu pedido ${formatOrderNumber(order.order_number)} de Un Viaje Astral.`,
          )}
          target="_blank"
          rel="noreferrer"
          className="btn-mint btn-sm"
        >
          <MessageCircle className="size-3.5" />
          Escribir por WhatsApp
        </a>
        <a href={`tel:${order.contact_phone}`} className="btn-outline btn-sm">
          <Phone className="size-3.5" />
          Llamar
        </a>
        <Link href="/admin/pedidos" className="btn-ghost btn-sm">
          <ReceiptText className="size-3.5" />
          Ver planilla
        </Link>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white/55 p-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-medium text-ink" title={value}>
        {value}
      </p>
    </div>
  );
}
