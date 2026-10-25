import { Check, PackageCheck, XCircle } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS: Array<{
  status: Exclude<OrderStatus, "cancelled">;
  title: string;
  description: string;
}> = [
  {
    status: "pending",
    title: "Recibido",
    description: "El equipo revisa stock y coordinación.",
  },
  {
    status: "confirmed",
    title: "Confirmado",
    description: "Validamos disponibilidad y forma de pago.",
  },
  {
    status: "preparing",
    title: "En preparación",
    description: "Estamos armando tu pedido.",
  },
  {
    status: "delivered",
    title: "Entregado",
    description: "Pedido completado.",
  },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-700">
          <XCircle className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-rose-900">
            {ORDER_STATUS_LABELS.cancelled}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-rose-800/80">
            Este pedido fue cancelado. Si tenés dudas, escribinos por WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.status === status);

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/55 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        <PackageCheck className="size-4 text-green-text" />
        Seguimiento
      </div>
      <ol className="mt-5 grid gap-4 sm:grid-cols-4 sm:gap-2">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={step.status} className="relative flex gap-3 sm:block">
              {index < STEPS.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px sm:left-1/2 sm:top-4 sm:h-px sm:w-full",
                    done ? "bg-green/40" : "bg-ink/10",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold transition sm:mx-auto",
                  done
                    ? "border-green bg-green text-white"
                    : active
                      ? "border-green bg-mint text-deep animate-pulse-soft"
                      : "border-ink/15 bg-white text-muted",
                )}
              >
                {done ? <Check className="size-4" /> : index + 1}
              </span>
              <div className="pb-4 sm:mt-2 sm:pb-0 sm:text-center">
                <p
                  className={cn(
                    "text-xs font-semibold",
                    active || done ? "text-ink" : "text-muted",
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
