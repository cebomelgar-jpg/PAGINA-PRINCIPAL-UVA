"use client";

import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  AlertCircle,
  Check,
  Edit3,
  ImagePlus,
  Loader2,
  PackagePlus,
  Plus,
  Power,
  PowerOff,
  Save,
  Search,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { ProductImage } from "@/components/catalog/product-image";
import { useToast } from "@/components/providers/toast-provider";
import { createClient } from "@/lib/supabase/client";
import {
  deleteProductAction,
  saveProductAction,
  toggleProductActiveAction,
  updateStockAction,
} from "@/lib/actions/catalog";
import { CATEGORY_LABELS, formatARS } from "@/lib/format";
import type { ActionState, Product, ProductCategory } from "@/lib/types";
import { cn, normalizeSearch, slugify } from "@/lib/utils";

type CategoryFilter = "todos" | ProductCategory;
type StatusFilter = "todos" | "active" | "inactive";

const CATEGORY_FILTERS: Array<{ value: CategoryFilter; label: string }> = [
  { value: "todos", label: "Todo" },
  { value: "flores", label: "Flores" },
  { value: "rosin_hash", label: "Rosin" },
  { value: "vapes", label: "Vapes" },
];

export function AdminCatalogManager({
  products,
  initialEditId,
}: {
  products: Product[];
  initialEditId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryFilter>("todos");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(() => {
    if (initialEditId) {
      return products.find((product) => product.id === initialEditId) ?? null;
    }
    return null;
  });
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialEditId) {
      const match = products.find((product) => product.id === initialEditId);
      if (match) setEditing(match);
    }
  }, [initialEditId, products]);

  function closeEditor() {
    setEditing(null);
    if (initialEditId) {
      router.replace("/admin/catalogo", { scroll: false });
    }
  }

  const counts = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.active).length,
      inactive: products.filter((product) => !product.active).length,
    }),
    [products],
  );

  const filtered = useMemo(() => {
    const term = normalizeSearch(search);
    return products.filter((product) => {
      if (category !== "todos" && product.category !== category) return false;
      if (status === "active" && !product.active) return false;
      if (status === "inactive" && product.active) return false;
      if (!term) return true;
      return normalizeSearch(
        [
          product.name,
          product.slug,
          product.description ?? "",
          product.aromas.join(" "),
          product.flavors.join(" "),
        ].join(" "),
      ).includes(term);
    });
  }, [products, category, status, search]);

  async function toggleActive(product: Product) {
    if (!product.active && product.price <= 0) {
      toast({
        title: "Falta el precio",
        description: "Asigná un precio mayor a cero antes de publicar.",
        variant: "info",
      });
      return;
    }

    setTogglingId(product.id);
    const formData = new FormData();
    formData.set("productId", product.id);
    formData.set("active", String(!product.active));
    await toggleProductActiveAction(formData);
    setTogglingId(null);
    toast({
      title: product.active ? "Producto oculto" : "Producto publicado",
      description: product.name,
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                aria-pressed={category === item.value}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                  category === item.value
                    ? "bg-ink text-paper shadow-card"
                    : "text-muted hover:bg-ink/5 hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-ink/10" />
            {(
              [
                ["todos", `Todos ${counts.total}`],
                ["active", `Activos ${counts.active}`],
                ["inactive", `Ocultos ${counts.inactive}`],
              ] as Array<[StatusFilter, string]>
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-medium transition",
                  status === value
                    ? "bg-mint/35 text-green-text"
                    : "text-muted hover:bg-ink/5 hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto"
                className="input h-9 py-2 pl-9 pr-8 text-xs"
                aria-label="Buscar productos"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-ink"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="btn-primary btn-sm"
            >
              <Plus className="size-3.5" />
              Nuevo producto
            </button>
          </div>
        </div>
        <p className="text-[11px] text-muted">
          Para publicar un producto necesita precio mayor a cero. Los productos
          con stock 0 se muestran como agotados si están activos.
        </p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Cannabinoides</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Visibilidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-ink/5">
                      <ProductImage
                        src={product.image_url}
                        alt={product.name}
                        sizes="44px"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="max-w-44 truncate text-xs font-semibold text-ink">
                          {product.name}
                        </p>
                        {product.featured ? (
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                        ) : null}
                      </div>
                      <p className="max-w-44 truncate text-[10px] text-muted">
                        {product.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="chip">{CATEGORY_LABELS[product.category]}</span>
                </td>
                <td>
                  <p className="text-[11px] text-ink">
                    {product.thc ? `THC ${product.thc}` : "THC —"}
                  </p>
                  <p className="text-[10px] text-muted">
                    {product.cbd ? `CBD ${product.cbd}` : "CBD —"}
                  </p>
                </td>
                <td>
                  <p className="whitespace-nowrap text-xs font-semibold text-ink">
                    {product.price > 0 ? formatARS(product.price) : "Sin precio"}
                  </p>
                  <p className="text-[10px] text-muted">
                    {product.presentation || "—"}
                  </p>
                </td>
                <td>
                  <StockEditor product={product} />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => toggleActive(product)}
                    disabled={togglingId === product.id}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition disabled:opacity-60",
                      product.active
                        ? "border-green/25 bg-mint/20 text-green-text"
                        : "border-ink/15 bg-ink/5 text-muted",
                    )}
                    title={
                      !product.active && product.price <= 0
                        ? "Asigná un precio antes de publicar"
                        : undefined
                    }
                  >
                    {togglingId === product.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : product.active ? (
                      <Power className="size-3" />
                    ) : (
                      <PowerOff className="size-3" />
                    )}
                    {product.active ? "Activo" : "Oculto"}
                  </button>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(product)}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-ink/5 hover:text-ink"
                      aria-label={`Editar ${product.name}`}
                    >
                      <Edit3 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(product)}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-rose/10 hover:text-rose"
                      aria-label={`Eliminar ${product.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <PackagePlus className="mx-auto size-8 text-muted/50" />
            <p className="mt-3 text-sm font-medium text-ink">
              No hay productos para este filtro.
            </p>
            <p className="mt-1 text-xs text-muted">
              Probá limpiar la búsqueda o creá un producto nuevo.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("todos");
                setStatus("todos");
              }}
              className="btn-outline btn-sm mt-4"
            >
              Limpiar filtros
            </button>
          </div>
        ) : null}
      </div>

      <Dialog
        open={editing !== null}
        onClose={closeEditor}
        title={editing === "new" ? "Nuevo producto" : "Editar producto"}
        description={
          editing === "new"
            ? "Completá la ficha. Podés guardarlo oculto y publicarlo cuando tenga precio y stock."
            : "Los cambios se reflejan en el catálogo de pacientes."
        }
        size="xl"
      >
        {editing !== null ? (
          <ProductForm
            key={editing === "new" ? "new" : editing.id}
            product={editing === "new" ? null : editing}
            onCancel={closeEditor}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar producto"
        description={deleteTarget?.name}
        size="md"
      >
        <form action={deleteProductAction} className="space-y-4">
          <input
            type="hidden"
            name="productId"
            value={deleteTarget?.id ?? ""}
          />
          <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-900">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>
              Esta acción elimina la ficha del catálogo. Los pedidos históricos
              conservan el nombre y el precio del producto, pero el stock deja de
              existir.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="btn-outline"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-danger">
              <Trash2 className="size-4" />
              Eliminar producto
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function StockEditor({ product }: { product: Product }) {
  const router = useRouter();
  const { toast } = useToast();
  const [value, setValue] = useState(String(product.stock));
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setValue(String(product.stock));
  }, [product.stock]);

  const changed = value !== String(product.stock);

  function save() {
    const formData = new FormData();
    formData.set("productId", product.id);
    formData.set("stock", value);
    startTransition(async () => {
      const result = await updateStockAction({}, formData);
      if (result.error) {
        toast({
          title: "No pudimos actualizar el stock",
          description: result.error,
          variant: "error",
        });
        setValue(String(product.stock));
        return;
      }
      toast({ title: "Stock actualizado", description: product.name });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        max={100000}
        step={1}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-8 w-16 rounded-lg border border-ink/15 bg-white px-2 text-center text-xs text-ink outline-none focus:border-green focus:ring-2 focus:ring-mint/40"
        aria-label={`Stock de ${product.name}`}
      />
      {changed ? (
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="grid size-8 place-items-center rounded-lg bg-mint text-deep transition hover:bg-mint/80 disabled:opacity-50"
          aria-label={`Guardar stock de ${product.name}`}
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
        </button>
      ) : null}
    </div>
  );
}

function ProductForm({
  product,
  onCancel,
}: {
  product: Product | null;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveProductAction,
    {},
  );
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const allowed = ["image/webp", "image/jpeg", "image/png", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setUploadError("Usá una imagen WebP, JPG, PNG o SVG.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen no puede superar los 5 MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
      setImageUrl(data.publicUrl);
      toast({
        title: "Imagen subida",
        description: "Se guardará al confirmar el producto.",
      });
    } catch {
      setUploadError(
        "No pudimos subir la imagen. Revisá la configuración de Storage o intentá con otra imagen.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="image_url" value={imageUrl} />

      {state.error ? (
        <div
          role="alert"
          className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{state.error}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            className="input"
            required
            minLength={2}
            maxLength={80}
            placeholder="Ej. Runtz"
          />
        </div>
        <div>
          <label htmlFor="slug" className="label">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugTouched(true);
            }}
            className="input"
            required
            minLength={2}
            maxLength={80}
            placeholder="runtz"
          />
          <p className="mt-1 text-[10px] text-muted">
            Identificador único en minúsculas. Se genera desde el nombre.
          </p>
        </div>

        <div>
          <label htmlFor="category" className="label">
            Categoría
          </label>
          <select
            id="category"
            name="category"
            className="select"
            defaultValue={product?.category ?? "flores"}
            required
          >
            <option value="flores">Flores secas</option>
            <option value="rosin_hash">Rosin Hash</option>
            <option value="vapes">Vapes</option>
          </select>
        </div>
        <div>
          <label htmlFor="presentation" className="label">
            Presentación
          </label>
          <input
            id="presentation"
            name="presentation"
            type="text"
            defaultValue={product?.presentation ?? ""}
            className="input"
            maxLength={40}
            placeholder="Ej. Flores secas"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="label">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={product?.description ?? ""}
            className="textarea"
            rows={4}
            maxLength={2000}
            placeholder="Aromas, sabores, efectos y cualquier detalle útil."
          />
        </div>

        <div>
          <label htmlFor="thc" className="label">
            THC
          </label>
          <input
            id="thc"
            name="thc"
            type="text"
            defaultValue={product?.thc ?? ""}
            className="input"
            maxLength={20}
            placeholder="Ej. 23–26%"
          />
        </div>
        <div>
          <label htmlFor="cbd" className="label">
            CBD
          </label>
          <input
            id="cbd"
            name="cbd"
            type="text"
            defaultValue={product?.cbd ?? ""}
            className="input"
            maxLength={20}
            placeholder="Ej. 13,5%"
          />
        </div>
        <div>
          <label htmlFor="sativa_percent" className="label">
            Sativa %
          </label>
          <input
            id="sativa_percent"
            name="sativa_percent"
            type="number"
            min={0}
            max={100}
            step={1}
            defaultValue={product?.sativa_percent ?? ""}
            className="input"
            placeholder="Ej. 60"
          />
        </div>
        <div>
          <label htmlFor="indica_percent" className="label">
            Indica %
          </label>
          <input
            id="indica_percent"
            name="indica_percent"
            type="number"
            min={0}
            max={100}
            step={1}
            defaultValue={product?.indica_percent ?? ""}
            className="input"
            placeholder="Ej. 40"
          />
        </div>

        <div>
          <label htmlFor="price" className="label">
            Precio (ARS)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            max={100000000}
            step="0.01"
            defaultValue={product?.price ?? 0}
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="stock" className="label">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            max={100000}
            step={1}
            defaultValue={product?.stock ?? 0}
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="sort_order" className="label">
            Orden
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            step={1}
            defaultValue={product?.sort_order ?? 0}
            className="input"
          />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-ink">
            <input
              type="checkbox"
              name="active"
              defaultChecked={product?.active ?? false}
              className="size-4 accent-[#009468]"
            />
            Publicado
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-ink">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="size-4 accent-[#009468]"
            />
            Destacado
          </label>
        </div>

        <div>
          <label htmlFor="aromas" className="label">
            Aromas
          </label>
          <input
            id="aromas"
            name="aromas"
            type="text"
            defaultValue={product?.aromas.join(", ") ?? ""}
            className="input"
            placeholder="Afrutado, dulce, cítrico"
          />
          <p className="mt-1 text-[10px] text-muted">Separados por coma.</p>
        </div>
        <div>
          <label htmlFor="flavors" className="label">
            Sabores
          </label>
          <input
            id="flavors"
            name="flavors"
            type="text"
            defaultValue={product?.flavors.join(", ") ?? ""}
            className="input"
            placeholder="Frutal, dulce"
          />
          <p className="mt-1 text-[10px] text-muted">Separados por coma.</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="effects" className="label">
            Efectos
          </label>
          <input
            id="effects"
            name="effects"
            type="text"
            defaultValue={product?.effects.join(", ") ?? ""}
            className="input"
            placeholder="Relajante, creatividad"
          />
          <p className="mt-1 text-[10px] text-muted">
            Separados por coma. Sin afirmaciones médicas.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white/55 p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink/5 sm:w-48">
            {imageUrl ? (
              <ProductImage
                src={imageUrl}
                alt="Vista previa"
                sizes="192px"
              />
            ) : (
              <div className="grid h-full place-items-center text-muted">
                <ImagePlus className="size-7" />
              </div>
            )}
            {uploading ? (
              <div className="absolute inset-0 grid place-items-center bg-deep/50 text-white">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink">Imagen del producto</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              Subí una imagen de hasta 5 MB (WebP, JPG, PNG o SVG). Se guarda en
              Supabase Storage y queda pública para el catálogo.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="btn-outline btn-sm cursor-pointer">
                {uploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="size-3.5" />
                )}
                Subir imagen
                <input
                  type="file"
                  accept="image/webp,image/jpeg,image/png,image/svg+xml"
                  onChange={handleFile}
                  className="sr-only"
                  disabled={uploading}
                />
              </label>
              {imageUrl ? (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="btn-ghost btn-sm text-rose-700"
                >
                  <Trash2 className="size-3.5" />
                  Quitar
                </button>
              ) : null}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              className="input mt-3 h-9 py-2 text-[11px]"
              placeholder="O pegá una URL de imagen"
              aria-label="URL de imagen"
            />
            {uploadError ? (
              <p className="mt-2 text-[11px] text-rose-700">{uploadError}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-ink/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] leading-relaxed text-muted">
          Para publicar, el precio debe ser mayor a cero. Podés guardar oculto y
          activarlo después.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline"
            disabled={pending || uploading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={pending || uploading}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Save className="size-4" />
                Guardar producto
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
