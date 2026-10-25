import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "mint" | "dark" | "amber";
}) {
  const tones = {
    default: "card",
    mint: "card border-green/20 bg-mint/20",
    dark: "card-dark",
    amber: "card border-amber-200 bg-amber-50/80",
  } as const;

  const iconTones = {
    default: "bg-ink/5 text-ink",
    mint: "bg-green/10 text-green-text",
    dark: "bg-white/10 text-mint",
    amber: "bg-amber-100 text-amber-700",
  } as const;

  return (
    <div className={cn("p-5", tones[tone])}>
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.18em]",
            tone === "dark" ? "text-mint" : "text-muted",
          )}
        >
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl",
              iconTones[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-4 font-display text-3xl leading-none">{value}</p>
      {hint ? (
        <p
          className={cn(
            "mt-2 text-xs",
            tone === "dark" ? "text-paper/65" : "text-muted",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
