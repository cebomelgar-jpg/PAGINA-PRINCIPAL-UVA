import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`card flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}
    >
      {icon ? (
        <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-mint/25 text-green-text">
          {icon}
        </div>
      ) : null}
      <h2 className="text-xl text-ink">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
