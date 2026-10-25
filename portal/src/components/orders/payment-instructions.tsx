"use client";

import { Check, Copy, Landmark, MessageCircle, ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { BANK_DETAILS, whatsappUrl } from "@/lib/config";
import { formatARS, PAYMENT_METHOD_LABELS } from "@/lib/format";
import type { PaymentMethod, PaymentStatus } from "@/lib/types";

export function PaymentInstructions({
  paymentMethod,
  paymentStatus,
  total,
}: {
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: number;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const hasBankDetails = Boolean(
    BANK_DETAILS.alias || BANK_DETAILS.cbu || BANK_DETAILS.holder,
  );

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
      toast({ title: "Copiado", description: `${label} copiado.` });
    } catch {
      toast({
        title: "No pudimos copiar",
        description: "Seleccioná el texto y copialo manualmente.",
        variant: "error",
      });
    }
  }

  if (paymentStatus === "paid") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-green/20 bg-mint/20 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-green text-white">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Pago confirmado</p>
          <p className="mt-0.5 text-xs leading-relaxed text-green-text">
            El equipo ya validó el pago de {formatARS(total)}. No tenés que hacer
            nada más por ahora.
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "cancelled") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
        El pago de este pedido fue cancelado junto con el pedido.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        {paymentMethod === "bank_transfer" ? (
          <Landmark className="size-4 text-green-text" />
        ) : (
          <Wallet className="size-4 text-green-text" />
        )}
        <p className="text-sm font-semibold text-ink">
          {PAYMENT_METHOD_LABELS[paymentMethod]}
        </p>
      </div>

      {paymentMethod === "cash" ? (
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Abonás en efectivo al retirar o recibir el pedido. El equipo coordina
          el encuentro y confirma el pago antes de la entrega. No se solicita
          pago por adelantado desde el portal.
        </p>
      ) : hasBankDetails ? (
        <div className="mt-3">
          <p className="text-xs leading-relaxed text-muted">
            Transferí <strong className="text-ink">{formatARS(total)}</strong> y
            enviá el comprobante por WhatsApp para que el equipo valide el pago.
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
        </div>
      ) : (
        <div className="mt-3 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          <MessageCircle className="mt-0.5 size-4 shrink-0" />
          <p>
            Los datos bancarios se coordinan por WhatsApp. Escribinos para
            recibirlos y transferir {formatARS(total)}.
          </p>
        </div>
      )}

      <a
        href={whatsappUrl(
          `Hola, quiero coordinar el pago de un pedido de ${formatARS(total)}.`,
        )}
        target="_blank"
        rel="noreferrer"
        className="btn-outline btn-sm mt-4 w-full"
      >
        <MessageCircle className="size-3.5" />
        Coordinar por WhatsApp
      </a>
    </div>
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
