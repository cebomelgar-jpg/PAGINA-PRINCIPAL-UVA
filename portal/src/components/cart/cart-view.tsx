"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { ProductImage } from "@/components/catalog/product-image";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORY_LABELS, formatARS } from "@/lib/format";

export function CartView() {
  const { items, ready, subtotal, totalItems, setQuantity, removeItem, clear } =
    useCart();

  if (!ready) {
    return (
      <div className="card h-64 animate-pulse bg-white/50" aria-label="Cargando carrito" />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-6" />}
        title="Tu carrito está vacío"
        description="Explorá el catálogo y agregá los productos que quieras consultar. Podés revisar cantidades y stock antes de confirmar."
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
    <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
      <div className="card divide-y divide-ink/10 p-0">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 p-4 sm:p-5">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-ink/5 sm:size-28">
              <ProductImage
                src={item.imageUrl}
                alt={item.name}
                sizes="112px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-green-text">
                    {CATEGORY_LABELS[item.category]}
                  </p>
                  <h2 className="mt-0.5 truncate text-lg text-ink">{item.name}</h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatARS(item.price)} por unidad
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="rounded-full p-2 text-muted transition hover:bg-rose/10 hover:text-rose"
                  aria-label={`Quitar ${item.name} del carrito`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                <div className="flex items-center rounded-full border border-ink/15 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    className="grid size-8 place-items-center rounded-full text-ink transition hover:bg-ink/5"
                    aria-label="Quitar una unidad"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-9 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    className="grid size-8 place-items-center rounded-full text-ink transition hover:bg-ink/5 disabled:opacity-40"
                    aria-label="Agregar una unidad"
                    disabled={item.quantity >= item.stock || item.quantity >= 99}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                    Subtotal
                  </p>
                  <p className="text-base font-semibold text-ink">
                    {formatARS(item.price * item.quantity)}
                  </p>
                </div>
              </div>
              {item.quantity >= item.stock ? (
                <p className="mt-2 text-[11px] text-amber-700">
                  Alcanzaste el stock disponible ({item.stock} unidades).
                </p>
              ) : null}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 p-4 sm:px-5">
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium text-muted transition hover:text-rose"
          >
            Vaciar carrito
          </button>
          <Link
            href="/portal/catalogo"
            className="text-xs font-medium text-green-text hover:underline"
          >
            Seguir comprando
          </Link>
        </div>
      </div>

      <aside className="card h-fit p-5 xl:sticky xl:top-6">
        <p className="eyebrow">Resumen</p>
        <h2 className="mt-1 text-2xl text-ink">Tu pedido</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between text-muted">
            <span>Productos ({totalItems})</span>
            <span>{formatARS(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>Envío</span>
            <span>A coordinar</span>
          </div>
          <div className="h-px bg-ink/10" />
          <div className="flex items-end justify-between">
            <span className="font-semibold text-ink">Total estimado</span>
            <span className="text-xl font-semibold text-ink">
              {formatARS(subtotal)}
            </span>
          </div>
        </div>

        <Link href="/portal/checkout" className="btn-primary mt-6 w-full">
          Continuar con el pedido
          <ArrowRight className="size-4" />
        </Link>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          El total definitivo se calcula en el servidor con los precios y el
          stock vigentes al confirmar. Si un producto se agotó, te avisaremos.
        </p>
      </aside>
    </div>
  );
}
