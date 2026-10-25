import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import {
  AnalyticsBreakdowns,
  AnalyticsEmptyHint,
  AnalyticsRangeTabs,
  TrendChart,
} from "@/components/admin/analytics-charts";
import { requireAdmin } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/data";
import { formatARS, formatDate } from "@/lib/format";
import type { AnalyticsRange } from "@/lib/types";

export const metadata: Metadata = {
  title: "Analíticas",
};

const RANGES: AnalyticsRange[] = ["semana", "mes", "anio"];

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const range = RANGES.includes(params.rango as AnalyticsRange)
    ? (params.rango as AnalyticsRange)
    : "mes";
  const data = await getAdminAnalytics(range);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Analíticas"
        title="Cómo se mueve el portal."
        description={`${data.rangeLabel}: ${formatDate(data.start)} — ${formatDate(data.end)}. Ingresos y pedidos sin cancelados.`}
        actions={
          <>
            <AnalyticsRangeTabs active={range} basePath="/admin/analiticas" />
            <Link href="/admin/pedidos" className="btn-outline">
              <ClipboardList className="size-4" />
              Ver pedidos
            </Link>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Ingresos"
          value={formatARS(data.metrics.revenue)}
          hint={data.rangeLabel}
          icon={<Wallet className="size-4" />}
          tone="dark"
        />
        <MetricCard
          label="Pedidos"
          value={String(data.metrics.orders)}
          hint={`${data.metrics.cancelled} cancelados excluidos`}
          icon={<ClipboardList className="size-4" />}
        />
        <MetricCard
          label="Ticket promedio"
          value={formatARS(data.metrics.averageTicket)}
          hint="Por pedido válido"
          icon={<TrendingUp className="size-4" />}
          tone="mint"
        />
        <MetricCard
          label="Pacientes"
          value={String(data.metrics.patients)}
          hint="Con al menos un pedido"
          icon={<Users className="size-4" />}
        />
        <MetricCard
          label="Pendientes"
          value={String(data.metrics.pending)}
          hint="Requieren revisión"
          icon={<CircleDollarSign className="size-4" />}
          tone="amber"
        />
        <MetricCard
          label="Cancelados"
          value={String(data.metrics.cancelled)}
          hint="No suman a ingresos"
          icon={<BarChart3 className="size-4" />}
        />
      </section>

      <section className="card p-5 sm:p-6">
        <TrendChart buckets={data.buckets} />
      </section>

      <AnalyticsBreakdowns data={data} />

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <AnalyticsEmptyHint>
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-green-text" />
            <p>
              <strong className="text-ink">Cómo leer estos datos:</strong> los
              ingresos incluyen pedidos pendientes, confirmados, en preparación y
              entregados; los cancelados se excluyen. No es un reporte contable ni
              reemplaza la conciliación de pagos.
            </p>
          </div>
        </AnalyticsEmptyHint>
        <Link
          href="/admin/pedidos"
          className="btn-mint btn-sm md:justify-self-end"
        >
          Ir a la planilla
          <ExternalLink className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
