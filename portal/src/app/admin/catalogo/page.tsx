import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Leaf } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { AdminCatalogManager } from "@/components/admin/admin-catalog-manager";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Catálogo",
};

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    guardado?: string;
    eliminado?: string;
    error?: string;
    editar?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const products = await getAllProducts();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Productos y stock"
        description="Creá fichas, actualizá precios y stock, subí imágenes y decidí qué productos ve el paciente."
        actions={
          <Link href="/portal/catalogo" className="btn-outline">
            <Leaf className="size-4" />
            Ver catálogo público
          </Link>
        }
      />

      {params.guardado === "1" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-green/25 bg-mint/20 p-4 text-xs leading-relaxed text-green-text">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <p>Producto guardado. Los cambios ya se reflejan en el catálogo.</p>
        </div>
      ) : null}

      {params.eliminado === "1" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-green/25 bg-mint/20 p-4 text-xs leading-relaxed text-green-text">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <p>Producto eliminado del catálogo.</p>
        </div>
      ) : null}

      {params.error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{params.error}</p>
        </div>
      ) : null}

      <AdminCatalogManager products={products} initialEditId={params.editar} />
    </div>
  );
}
