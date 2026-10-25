import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { requireProfile } from "@/lib/auth";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Confirmar pedido",
};

export default async function CheckoutPage() {
  const profile = await requireProfile();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Checkout privado"
        title="Confirmá tu pedido."
        description="Completá el contacto, elegí cómo abonar y dejanos las indicaciones que necesites. El equipo revisa cada pedido antes de despachar."
        actions={
          <Link href="/portal/carrito" className="btn-outline">
            <ArrowLeft className="size-4" />
            Volver al carrito
          </Link>
        }
      />

      <div className="flex items-center gap-2 rounded-2xl border border-green/15 bg-mint/15 px-4 py-3 text-xs text-green-text">
        <LockKeyhole className="size-4" />
        Tus datos y los detalles del pedido se comparten solo con el equipo
        administrativo.
      </div>

      <CheckoutForm profile={profile} />
    </div>
  );
}
