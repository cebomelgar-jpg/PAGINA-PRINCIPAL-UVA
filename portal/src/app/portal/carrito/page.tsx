import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CartView } from "@/components/cart/cart-view";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Carrito",
};

export default function CartPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Tu selección"
        title="Carrito"
        description="Revisá cantidades, stock y subtotales antes de continuar. El total definitivo se recalcula en el servidor."
        actions={
          <Link href="/portal/catalogo" className="btn-outline">
            <ArrowLeft className="size-4" />
            Seguir explorando
          </Link>
        }
      />
      <CartView />
    </div>
  );
}
