import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  Leaf,
  MessageCircle,
  Package,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/catalog/product-image";
import { getPatientOverview } from "@/lib/data";
import { requireProfile } from "@/lib/auth";
import { formatARS, formatDate, formatOrderNumber, CATEGORY_LABELS } from "@/lib/format";
import { whatsappUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "Resumen",
};

export default async function PortalDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireProfile();
  const params = await searchParams;
  const overview = await getPatientOverview(profile.id);
  const firstName = profile.full_name.split(/\s+/)[0] || "paciente";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Portal de pacientes"
        title={`Hola, ${firstName}.`}
        description="Este es tu espacio privado. Revisá tus pedidos, consultá el catálogo y coordiná todo con el equipo."
        actions={
          <>
            <Link href="/portal/catalogo" className="btn-primary">
              <Leaf className="size-4" />
              Ver catálogo
            </Link>
            <a
              href={whatsappUrl("Hola, necesito ayuda con mi cuenta del portal de pacientes.")}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              <MessageCircle className="size-4" />
              Escribir al equipo
            </a>
          </>
        }
      />

      {params.error === "forbidden" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No tenés permisos para acceder a la administración.
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Pedidos realizados"
          value={String(overview.totalOrders)}
          hint="Historial completo"
          icon={<ClipboardList className="size-4" />}
        />
        <MetricCard
          label="Pendientes"
          value={String(overview.pending)}
          hint="Esperando confirmación"
          icon={<Package className="size-4" />}
          tone="amber"
        />
        <MetricCard
          label="Entregados"
          value={String(overview.delivered)}
          hint="Pedidos completados"
          icon={<CalendarCheck2 className="size-4" />}
          tone="mint"
        />
        <MetricCard
          label="Total invertido"
          value={formatARS(overview.totalSpent)}
          hint="Sin contar cancelados"
          icon={<Wallet className="size-4" />}
          tone="dark"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Actividad</p>
              <h2 className="mt-1 text-2xl text-ink">Tus últimos pedidos</h2>
            </div>
            <Link href="/portal/pedidos" className="link-underline text-xs">
              Ver todos
            </Link>
          </div>

          {overview.orders.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-ink/15 bg-white/40 p-6 text-center">
              <p className="text-sm font-medium text-ink">Todavía no hiciste pedidos.</p>
              <p className="mt-1 text-xs text-muted">
                Cuando confirmes el primero, vas a poder seguir su estado desde acá.
              </p>
              <Link href="/portal/catalogo" className="btn-mint btn-sm mt-4">
                Explorar catálogo
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-ink/10">
              {overview.orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/portal/pedidos/${order.id}`}
                  className="flex items-center justify-between gap-4 py-4 transition hover:bg-mint/5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {formatOrderNumber(order.order_number)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="hidden text-sm font-semibold text-ink sm:block">
                      {formatARS(order.total)}
                    </span>
                    <ArrowRight className="size-4 text-muted" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card-dark flex flex-col justify-between overflow-hidden p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-mint">
              Antes de confirmar
            </p>
            <h2 className="mt-3 text-2xl text-paper">
              Contanos qué necesitás.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-paper/65">
              En el checkout podés dejar una nota con tus necesidades
              terapéuticas. Esa información solo la ve el equipo que gestiona tu
              pedido.
            </p>
          </div>
          <div className="mt-8 space-y-3 text-xs text-paper/70">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="size-4 text-mint" />
              Carrito guardado en tu dispositivo
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-4 text-mint" />
              Stock validado al confirmar
            </div>
          </div>
          <Link
            href="/portal/carrito"
            className="btn-mint mt-8 w-full"
          >
            Revisar mi carrito
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Disponible ahora</p>
            <h2 className="mt-1 text-2xl text-ink">Selección para vos</h2>
          </div>
          <Link href="/portal/catalogo" className="link-underline text-xs">
            Ver catálogo completo
          </Link>
        </div>

        {overview.featured.length === 0 ? (
          <EmptyState
            className="mt-5"
            icon={<Leaf className="size-6" />}
            title="Catálogo en preparación"
            description="El administrador todavía no publicó productos con precio y stock. Mientras tanto, podés escribirnos por WhatsApp."
            action={
              <a
                href={whatsappUrl("Hola, quisiera consultar por los productos disponibles.")}
                target="_blank"
                rel="noreferrer"
                className="btn-outline btn-sm"
              >
                <MessageCircle className="size-3.5" />
                Consultar disponibilidad
              </a>
            }
          />
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overview.featured.map((product) => (
              <Link
                key={product.id}
                href="/portal/catalogo"
                className="group card overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="relative h-40 bg-ink/5">
                  <ProductImage
                    src={product.image_url}
                    alt={product.name}
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-green-text">
                    {CATEGORY_LABELS[product.category]}
                  </p>
                  <h3 className="mt-1 text-base text-ink">{product.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {product.price > 0 ? formatARS(product.price) : "Precio a confirmar"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
