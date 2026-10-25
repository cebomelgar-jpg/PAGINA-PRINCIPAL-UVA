"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = Omit<Toast, "id" | "variant"> & {
  variant?: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-white text-ink",
  error: "border-rose-200 bg-white text-ink",
  info: "border-sky-200 bg-white text-ink",
};

const VARIANT_ICON_STYLES: Record<ToastVariant, string> = {
  success: "bg-emerald-50 text-emerald-700",
  error: "bg-rose-50 text-rose-700",
  info: "bg-sky-50 text-sky-700",
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "error") return <AlertCircle className="size-4" />;
  if (variant === "info") return <Info className="size-4" />;
  return <CheckCircle2 className="size-4" />;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      const next: Toast = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "success",
      };
      setToasts((current) => [...current.slice(-3), next]);
      window.setTimeout(() => remove(id), 4600);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-soft animate-fade-up",
              VARIANT_STYLES[item.variant],
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                VARIANT_ICON_STYLES[item.variant],
              )}
            >
              <ToastIcon variant={item.variant} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {item.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="rounded-full p-1 text-muted transition hover:bg-ink/5 hover:text-ink"
              aria-label="Cerrar notificación"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider.");
  }
  return context;
}
