"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, TriangleAlert, XCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/providers/toast-provider";
import { cancelOrderAction } from "@/lib/actions/orders";

export function CancelOrderButton({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelOrderAction(orderId);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      toast({
        title: "Pedido cancelado",
        description: "El stock volvió a estar disponible en el catálogo.",
      });
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-outline btn-sm border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50"
      >
        <XCircle className="size-3.5" />
        Cancelar pedido
      </button>

      <Dialog
        open={open}
        onClose={() => {
          if (!pending) setOpen(false);
        }}
        title="Cancelar pedido"
        description={`Pedido #${String(orderNumber).padStart(5, "0")}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-900">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              Esta acción no se puede deshacer. El stock de los productos vuelve
              al catálogo y el pedido queda cancelado.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-white p-3 text-xs text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-outline"
              disabled={pending}
            >
              Volver
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-danger"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Cancelando…
                </>
              ) : (
                <>
                  <XCircle className="size-4" />
                  Sí, cancelar
                </>
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
