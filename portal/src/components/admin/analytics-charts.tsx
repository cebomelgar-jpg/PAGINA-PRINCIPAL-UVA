import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, CircleDollarSign, Package, TrendingUp } from "lucide-react";
import type {
  AnalyticsBucket,
  AnalyticsData,
  PaymentMethod,
  ProductCategory,
} from "@/lib/types";
import {
  CATEGORY_LABELS,
  formatARS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/format";
import { cn } from "@/lib/utils";

function compactARS(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toLocaleString("es-AR", {
      maximumFractionDigits: 1,
    })}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000).toLocaleString("es-AR")}k`;
  }
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function TrendChart({ buckets }: { buckets: AnalyticsBucket[] }) {
  const width = 820;
  const height = 280;
  const padLeft = 50;
  const padRight = 14;
  const padTop = 18;
  const padBottom = 46;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const maxRevenue = niceMax(Math.max(...buckets.map((bucket) => bucket.revenue), 0));
  const maxOrders = Math.max(...buckets.map((bucket) => bucket.orders), 1);
  const slot = plotW / Math.max(buckets.length, 1);
  const barW = Math.max(3, Math.min(24, slot * 0.56));
  const labelStep = buckets.length <= 8 ? 1 : buckets.length <= 12 ? 1 : 5;
  const peak = buckets.reduce<AnalyticsBucket | null>(
    (current, bucket) => (!current || bucket.revenue > current.revenue ? bucket : current),
    null,
  );

  const points = buckets.map((bucket, index) => {
    const x = padLeft + slot * index + slot / 2;
    const y = padTop + plotH - (bucket.orders / maxOrders) * plotH * 0.82;
    return { x, y };
  });
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Evolución</p>
          <h2 className="mt-1 text-2xl text-ink">Ingresos y pedidos</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-green" />
            Ingresos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-purple" />
            Pedidos
          </span>
        </div>
      </div>

      {buckets.every((bucket) => bucket.orders === 0) ? (
        <div className="mt-5 grid h-64 place-items-center rounded-2xl border border-dashed border-ink/15 text-center">
          <div>
            <TrendingUp className="mx-auto size-7 text-muted/50" />
            <p className="mt-2 text-sm font-medium text-ink">Todavía no hay ventas</p>
            <p className="mt-1 text-xs text-muted">
              Los pedidos confirmados en este período van a aparecer acá.
            </p>
          </div>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mt-4 h-auto w-full overflow-visible"
          role="img"
          aria-label="Gráfico de ingresos y cantidad de pedidos por período"
        >
          <defs>
            <linearGradient id="revenue-bars" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#009468" />
              <stop offset="100%" stopColor="#80ffa6" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio) => {
            const y = padTop + plotH - plotH * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  x2={width - padRight}
                  y1={y}
                  y2={y}
                  stroke="#191b30"
                  strokeOpacity={0.09}
                  strokeDasharray={ratio === 0 ? undefined : "4 5"}
                />
                <text
                  x={padLeft - 9}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#65677b"
                >
                  {compactARS(maxRevenue * ratio)}
                </text>
              </g>
            );
          })}

          {buckets.map((bucket, index) => {
            const x = padLeft + slot * index + (slot - barW) / 2;
            const barH = (bucket.revenue / maxRevenue) * plotH;
            return (
              <g key={bucket.key}>
                <rect
                  x={x}
                  y={padTop + plotH - barH}
                  width={barW}
                  height={Math.max(barH, bucket.revenue > 0 ? 2 : 0)}
                  rx={Math.min(4, barW / 2)}
                  fill="url(#revenue-bars)"
                >
                  <title>
                    {bucket.label}: {formatARS(bucket.revenue)} · {bucket.orders} pedidos
                  </title>
                </rect>
                {index % labelStep === 0 || index === buckets.length - 1 ? (
                  <text
                    x={padLeft + slot * index + slot / 2}
                    y={height - 20}
                    textAnchor="middle"
                    fontSize="8.5"
                    fill="#65677b"
                  >
                    {bucket.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          <path
            d={linePath}
            fill="none"
            stroke="#5d3fcc"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {points.map((point, index) => (
            <circle
              key={buckets[index]?.key ?? index}
              cx={point.x}
              cy={point.y}
              r={buckets.length > 20 ? 2 : 3}
              fill="#fdf0ff"
              stroke="#5d3fcc"
              strokeWidth="2"
            >
              <title>
                {buckets[index]?.label}: {buckets[index]?.orders ?? 0} pedidos
              </title>
            </circle>
          ))}
        </svg>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3 text-[11px] text-muted">
        <p>
          Pico de ingresos:{" "}
          <strong className="text-ink">
            {peak && peak.revenue > 0
              ? `${peak.label} · ${formatARS(peak.revenue)}`
              : "Sin ventas"}
          </strong>
        </p>
        <p>Los pedidos cancelados no se incluyen en ingresos.</p>
      </div>
    </div>
  );
}

function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 110 110" className="size-full -rotate-90">
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="#191b30"
            strokeOpacity="0.08"
            strokeWidth="12"
          />
          {total > 0
            ? segments.map((segment) => {
                const length = (segment.value / total) * circumference;
                const dash = `${length} ${circumference - length}`;
                const element = (
                  <circle
                    key={segment.label}
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="12"
                    strokeDasharray={dash}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  >
                    <title>
                      {segment.label}: {segment.value}
                    </title>
                  </circle>
                );
                offset += length;
                return element;
              })
            : null}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[9px] uppercase tracking-[0.16em] text-muted">
              {centerLabel}
            </p>
            <p className="font-display text-2xl text-ink">{centerValue}</p>
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-[11px] text-muted">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="truncate">{segment.label}</span>
            </span>
            <span className="text-xs font-semibold text-ink">
              {segment.value}
              <span className="ml-1 text-[10px] font-normal text-muted">
                {total > 0 ? `${Math.round((segment.value / total) * 100)}%` : "0%"}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PAYMENT_COLORS: Record<PaymentMethod, string> = {
  cash: "#009468",
  bank_transfer: "#5d3fcc",
};

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  flores: "#009468",
  rosin_hash: "#5d3fcc",
  vapes: "#717ff5",
};

export function AnalyticsBreakdowns({ data }: { data: AnalyticsData }) {
  const maxStatus = Math.max(
    ...data.statusBreakdown.map((item) => item.count),
    1,
  );
  const maxCategory = Math.max(
    ...data.categoryBreakdown.map((item) => item.quantity),
    1,
  );

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Operación</p>
            <h2 className="mt-1 text-2xl text-ink">Estados de pedido</h2>
          </div>
          <Package className="size-5 text-green-text" />
        </div>
        <div className="mt-5 space-y-3">
          {data.statusBreakdown.map((item) => (
            <div key={item.status}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-ink">
                  {ORDER_STATUS_LABELS[item.status]}
                </span>
                <span className="text-muted">
                  {item.count} · {formatARS(item.total)}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green to-mint transition-all"
                  style={{ width: `${(item.count / maxStatus) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Pagos</p>
            <h2 className="mt-1 text-2xl text-ink">Métodos de pago</h2>
          </div>
          <CircleDollarSign className="size-5 text-green-text" />
        </div>
        <div className="mt-6">
          <DonutChart
            centerLabel="Pedidos"
            centerValue={String(
              data.paymentBreakdown.reduce((sum, item) => sum + item.count, 0),
            )}
            segments={data.paymentBreakdown.map((item) => ({
              label: PAYMENT_METHOD_LABELS[item.method],
              value: item.count,
              color: PAYMENT_COLORS[item.method],
            }))}
          />
        </div>
        <div className="mt-5 space-y-1.5 border-t border-ink/10 pt-4 text-[11px] text-muted">
          {data.paymentBreakdown.map((item) => (
            <div key={item.method} className="flex items-center justify-between">
              <span>{PAYMENT_METHOD_LABELS[item.method]}</span>
              <span className="font-semibold text-ink">{formatARS(item.total)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Mix de catálogo</p>
            <h2 className="mt-1 text-2xl text-ink">Por categoría</h2>
          </div>
          <ArrowUpRight className="size-5 text-green-text" />
        </div>
        <div className="mt-5 space-y-4">
          {data.categoryBreakdown.map((item) => (
            <div key={item.category}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-2 font-medium text-ink">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                  />
                  {CATEGORY_LABELS[item.category]}
                </span>
                <span className="text-muted">
                  {item.quantity} u. · {formatARS(item.revenue)}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(item.quantity / maxCategory) * 100}%`,
                    backgroundColor: CATEGORY_COLORS[item.category],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Ranking</p>
            <h2 className="mt-1 text-2xl text-ink">Productos más pedidos</h2>
          </div>
          <span className="chip">{data.topProducts.length} con movimiento</span>
        </div>

        {data.topProducts.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-ink/15 p-6 text-center text-xs text-muted">
            No hay productos vendidos en este período.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {data.topProducts.map((product, index) => (
              <div
                key={`${product.name}-${product.category ?? "sin"}`}
                className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/50 p-3"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink/5 text-[10px] font-bold text-muted">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">
                    {product.name}
                  </p>
                  <p className="text-[10px] text-muted">
                    {product.category ? CATEGORY_LABELS[product.category] : "Producto"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-ink">{product.quantity} u.</p>
                  <p className="text-[10px] text-muted">{formatARS(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function AnalyticsRangeTabs({
  active,
  basePath,
}: {
  active: AnalyticsData["range"];
  basePath: string;
}) {
  const options: Array<{ value: AnalyticsData["range"]; label: string; hint: string }> = [
    { value: "semana", label: "Semana", hint: "7 días" },
    { value: "mes", label: "Mes", hint: "30 días" },
    { value: "anio", label: "Año", hint: "12 meses" },
  ];

  return (
    <div className="inline-flex rounded-full border border-ink/10 bg-white/70 p-1 shadow-sm">
      {options.map((option) => (
        <Link
          key={option.value}
          href={`${basePath}?rango=${option.value}`}
          scroll={false}
          aria-current={active === option.value ? "page" : undefined}
          className={cn(
            "group flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition",
            active === option.value
              ? "bg-ink text-paper shadow-card"
              : "text-muted hover:bg-ink/5 hover:text-ink",
          )}
        >
          {option.label}
          <span
            className={cn(
              "hidden text-[9px] font-normal sm:inline",
              active === option.value ? "text-paper/60" : "text-muted/70",
            )}
          >
            {option.hint}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function AnalyticsEmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/55 p-4 text-[11px] leading-relaxed text-muted">
      {children}
    </div>
  );
}
