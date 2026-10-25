import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, MessageCircle, PackageSearch } from "lucide-react";
import { CatalogClient } from "@/components/catalog/catalog-client";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getActiveProducts } from "@/lib/data";
import { whatsappUrl } from "@/lib/config";
import type { ProductCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Catálogo",
};

const validCategories: ProductCategory[] = ["flores", "rosin_hash", "vapes"];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const params = await searchParams;
  const initialCategory = validCategories.includes(
    params.categoria as ProductCategory,
  )
    ? (params.categoria as ProductCategory)
    : "todos";
  const products = await getActiveProducts();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Catálogo privado"
        title="Elegí con calma."
        description="Fichas con cannabinoides, proporción sativa/indica, aromas, sabores y stock. Los precios y la disponibilidad se confirman al crear el pedido."
        actions={
          <Link href="/portal/carrito" className="btn-outline">
            <PackageSearch className="size-4" />
            Ver carrito
          </Link>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={<Leaf className="size-6" />}
          title="El catálogo está en preparación"
          description="El administrador todavía no publicó productos con precio y stock. Podés consultar disponibilidad mientras tanto."
          action={
            <a
              href={whatsappUrl("Hola, quisiera consultar por los productos disponibles en el portal.")}
              target="_blank"
              rel="noreferrer"
              className="btn-mint btn-sm"
            >
              <MessageCircle className="size-3.5" />
              Consultar por WhatsApp
            </a>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-green/15 bg-mint/15 px-4 py-3 text-xs text-green-text">
            <Leaf className="size-4" />
            Catálogo exclusivo para pacientes registrados. El stock se descuenta
            al confirmar el pedido.
          </div>
          <CatalogClient products={products} initialCategory={initialCategory} />
        </>
      )}
    </div>
  );
}
