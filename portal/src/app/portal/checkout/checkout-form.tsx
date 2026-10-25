"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Check,
  ClipboardCheck,
  Copy,
  Info,
  Landmark,
  Loader2,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/toast-provider";
import { ProductImage } from "@/components/catalog/product-image";
import { EmptyState } from "@/components/ui/empty-state";
import { createOrderAction } from "@/lib/actions/orders";
import { BANK_DETAILS } from "@/lib/config";
import { formatARS } from "@/lib/format";
import type { PaymentMethod, FulfillmentMethod, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CheckoutForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { items, ready, subtotal, clear } = useCart();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("pickup");
  const [contactPhone, setContactPhone] = useState(profile.phone ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [therapeuticNotes, setTherapeuticNotes] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const hasBankDetails = Boolean(
    BANK_DETAILS.alias || BANK_DETAILS.cbu || BANK_DETAILS.holder,
  );

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
      toast({ title: "Copiado", description: `${label} copiado al portapapeles.` });
    } catch {
      toast({
        title: "No pudimos copiar",
        description: "Seleccioná el texto y copialo manualmente.",
        variant: "error",
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!ready || items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    if (items.some((item) => item.price <= 0)) {
      setError(
        "Hay productos sin precio asignado. Quitalos del carrito o consultá con el equipo.",
      );
      return;
    }

    if (fulfillmentMethod === "delivery" && !deliveryAddress.trim()) {
      setError("Ingresá una dirección para la entrega.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrderAction({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
        fulfillmentMethod,
        contactPhone,
        deliveryAddress: fulfillmentMethod === "delivery" ? deliveryAddress : "",
        notes,
        therapeuticNotes,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      clear();
      toast({
        title: "Pedido creado",
        description: "El equipo va a revisar el stock y coordinar el pago.",
      });
      router.push(`/portal/pedidos/${result.orderId}?created=1`);
    } catch {
      setError(
        "No pudimos confirmar el pedido. Revisá tu conexión e intentá nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return <div className="card h-80 animate-pulse bg-white/50" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-6" />}
        title="No hay productos para confirmar"
        description="Agregá productos al carrito antes de completar el checkout."
        action={
          <Link href="/portal/catalogo" className="btn-primary">
            Ir al catálogo
            <ArrowRight className="size-4" />
          </Link>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <div className="space-y-5">
        {error ? (
          <div
            role="alert"
            className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-800"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-mint/25 text-green-text">
              <LockKeyhole className="size-4" />
            </span>
            <div>
              <p className="eyebrow">Paso 1</p>
              <h2 className="text-xl text-ink">Contacto y entrega</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="contactPhone" className="label">
                Teléfono de contacto
              </label>
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                autoComplete="tel"
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
                className="input"
                placeholder="Ej. 343 400 0000"
                required
                minLength={6}
                maxLength={30}
              />
              <p className="mt-1.5 text-[11px] text-muted">
                Lo usamos para coordinar el pago y la entrega. Podés cambiarlo
                para este pedido.
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="label">Método de entrega</span>
              <div className="grid gap-2 sm:grid-cols-2">
                <ChoiceCard
                  icon={<Store className="size-4" />}
                  title="Retiro en sede"
                  description="Coordinamos día y horario por WhatsApp."
                  selected={fulfillmentMethod === "pickup"}
                  onSelect={() => setFulfillmentMethod("pickup")}
                />
                <ChoiceCard
                  icon={<Truck className="size-4" />}
                  title="Envío / entrega"
                  description="Completá tu dirección y coordinamos."
                  selected={fulfillmentMethod === "delivery"}
                  onSelect={() => setFulfillmentMethod("delivery")}
                />
              </div>
            </div>

            {fulfillmentMethod === "delivery" ? (
              <div className="sm:col-span-2 animate-fade-in">
                <label htmlFor="deliveryAddress" className="label">
                  Dirección de entrega
                </label>
                <input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  type="text"
                  autoComplete="street-address"
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  className="input"
                  placeholder="Calle, número, localidad"
                  required
                  maxLength={300}
                />
              </div>
            ) : null}
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-mint/25 text-green-text">
              <Banknote className="size-4" />
            </span>
            <div>
              <p className="eyebrow">Paso 2</p>
              <h2 className="text-xl text-ink">Forma de pago</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <ChoiceCard
              icon={<Banknote className="size-4" />}
              title="Efectivo"
              description="Abonás al retirar o recibir el pedido."
              selected={paymentMethod === "cash"}
              onSelect={() => setPaymentMethod("cash")}
            />
            <ChoiceCard
              icon={<Landmark className="size-4" />}
              title="Transferencia"
              description="Te pasamos los datos para transferir."
              selected={paymentMethod === "bank_transfer"}
              onSelect={() => setPaymentMethod("bank_transfer")}
            />
          </div>

          {paymentMethod === "cash" ? (
            <div className="mt-4 flex gap-3 rounded-2xl border border-green/15 bg-mint/15 p-4 text-xs leading-relaxed text-green-text">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              <p>
                El pago en efectivo se coordina con el equipo al confirmar la
                entrega. No se solicita ningún pago por adelantado desde el
                portal.
              </p>
            </div>
          ) : hasBankDetails ? (
            <div className="mt-4 rounded-2xl border border-ink/10 bg-white/60 p-4">
              <p className="text-xs font-semibold text-ink">
                Datos para transferir
              </p>
              <div className="mt-3 space-y-2">
                {BANK_DETAILS.alias ? (
                  <CopyRow
                    label="Alias"
                    value={BANK_DETAILS.alias}
                    copied={copied === "Alias"}
                    onCopy={() => copyValue(BANK_DETAILS.alias, "Alias")}
                  />
                ) : null}
                {BANK_DETAILS.cbu ? (
                  <CopyRow
                    label="CBU / CVU"
                    value={BANK_DETAILS.cbu}
                    copied={copied === "CBU"}
                    onCopy={() => copyValue(BANK_DETAILS.cbu, "CBU")}
                  />
                ) : null}
                {BANK_DETAILS.holder ? (
                  <CopyRow
                    label="Titular"
                    value={BANK_DETAILS.holder}
                    copied={copied === "Titular"}
                    onCopy={() => copyValue(BANK_DETAILS.holder, "Titular")}
                  />
                ) : null}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                Enviá el comprobante por WhatsApp para que el equipo confirme el
                pago. El pedido queda pendiente hasta la validación.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
              <MessageCircle className="mt-0.5 size-4 shrink-0" />
              <p>
                Los datos bancarios se coordinan por WhatsApp. Elegí
                transferencia y escribinos para recibirlos antes de abonar.
              </p>
            </div>
          )}
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-mint/25 text-green-text">
              <ClipboardCheck className="size-4" />
            </span>
            <div>
              <p className="eyebrow">Paso 3</p>
              <h2 className="text-xl text-ink">Indicaciones para el equipo</h2>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="therapeuticNotes" className="label">
                Necesidades terapéuticas (opcional)
              </label>
              <textarea
                id="therapeuticNotes"
                name="therapeuticNotes"
                value={therapeuticNotes}
                onChange={(event) => setTherapeuticNotes(event.target.value)}
                className="textarea"
                placeholder="Contanos brevemente qué buscás, qué síntomas querés acompañar o qué preferencias tenés."
                maxLength={1000}
                rows={4}
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                Esta nota solo la ve el equipo que gestiona tu pedido. No
                reemplaza una consulta profesional.
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="label">
                Comentarios sobre la entrega (opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="textarea min-h-24"
                placeholder="Horarios, referencias o cualquier detalle útil."
                maxLength={1000}
                rows={3}
              />
            </div>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white/55 p-4 text-[11px] leading-relaxed text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-green-text" />
          <p>
            Al confirmar, el servidor valida precios y stock nuevamente. Si algún
            producto cambió, el pedido no se crea y te mostramos el motivo. No
            se procesan pagos con tarjeta desde el portal.
          </p>
        </div>
      </div>

      <aside className="card h-fit p-5 xl:sticky xl:top-6">
        <p className="eyebrow">Resumen final</p>
        <h2 className="mt-1 text-2xl text-ink">Tu pedido</h2>

        <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-ink/5">
                <ProductImage src={item.imageUrl} alt={item.name} sizes="48px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">
                  {item.name}
                </p>
                <p className="text-[11px] text-muted">
                  {item.quantity} × {formatARS(item.price)}
                </p>
              </div>
              <p className="text-xs font-semibold text-ink">
                {formatARS(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
          <div className="flex items-center justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatARS(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>Envío</span>
            <span>A coordinar</span>
          </div>
          <div className="flex items-end justify-between pt-2">
            <span className="font-semibold text-ink">Total</span>
            <span className="text-2xl font-semibold text-ink">
              {formatARS(subtotal)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary mt-6 w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Confirmando…
            </>
          ) : (
            <>
              Confirmar pedido
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <Link
          href="/portal/carrito"
          className="btn-ghost btn-sm mt-2 w-full"
        >
          Volver al carrito
        </Link>

        <div className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-muted">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-green-text" />
          Pedido privado. Solo vos y el equipo administrativo pueden verlo.
        </div>
      </aside>
    </form>
  );
}

function ChoiceCard({
  icon,
  title,
  description,
  selected,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 text-left transition",
        selected
          ? "border-green/35 bg-mint/15 shadow-[0_0_0_3px_rgba(128,255,166,0.16)]"
          : "border-ink/10 bg-white/60 hover:border-ink/20 hover:bg-white",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl",
          selected ? "bg-ink text-mint" : "bg-ink/5 text-muted",
        )}
      >
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
          {description}
        </span>
      </span>
    </button>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white px-3 py-2">
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
        <p className="truncate text-xs font-medium text-ink">{value}</p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="rounded-lg p-1.5 text-muted transition hover:bg-mint/20 hover:text-green-text"
        aria-label={`Copiar ${label}`}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
