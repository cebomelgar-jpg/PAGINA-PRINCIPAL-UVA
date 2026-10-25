"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowRight,
  Beaker,
  Leaf,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { ProductImage } from "@/components/catalog/product-image";
import { AddToCartButton } from "@/components/catalog/add-to-cart-button";
import { Dialog } from "@/components/ui/dialog";
import { CATEGORY_LABELS } from "@/lib/format";
import { formatARS } from "@/lib/format";
import type { Product, ProductCategory } from "@/lib/types";
import { cn, normalizeSearch } from "@/lib/utils";

type Filter = "todos" | ProductCategory;

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "todos", label: "Todo el catálogo" },
  { value: "flores", label: "Flores secas" },
  { value: "rosin_hash", label: "Rosin Hash" },
  { value: "vapes", label: "Vapes" },
];

const CATEGORY_NOTES: Record<ProductCategory, string> = {
  flores: "Genéticas seleccionadas con ficha de cannabinoides, aromas y efectos.",
  rosin_hash: "Extracciones sin solventes, de alta pureza.",
  vapes: "Formatos de vaporización para acompañar tu tratamiento.",
};

function PotencyChips({ product }: { product: Product }) {
  if (!product.thc && !product.cbd) {
    return <span className="chip">Perfil a definir</span>;
  }

  return (
    <>
      {product.thc ? (
        <span className="chip border-green/20 bg-mint/20 text-green-text">
          THC {product.thc}
        </span>
      ) : null}
      {product.cbd ? (
        <span className="chip border-purple/20 bg-purple/5 text-purple">
          CBD {product.cbd}
        </span>
      ) : null}
    </>
  );
}

function SativaBar({ product }: { product: Product }) {
  if (product.sativa_percent === null || product.indica_percent === null) {
    return (
      <div className="text-[11px] text-muted">
        Proporción sativa/indica a definir.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        <span>Sativa {product.sativa_percent}%</span>
        <span>Indica {product.indica_percent}%</span>
      </div>
      <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-purple/15">
        <span
          className="h-full rounded-full bg-green"
          style={{ width: `${product.sativa_percent}%` }}
        />
        <span
          className="h-full rounded-full bg-purple"
          style={{ width: `${product.indica_percent}%` }}
        />
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: () => void;
}) {
  return (
    <article className="group card flex flex-col overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative h-56 overflow-hidden bg-ink/5">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="transition duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper backdrop-blur">
            {CATEGORY_LABELS[product.category]}
          </span>
          {product.featured ? (
            <span className="rounded-full bg-mint px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-deep">
              Destacado
            </span>
          ) : null}
        </div>
        {product.stock <= 5 && product.stock > 0 ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
            Últimas {product.stock} unidades
          </span>
        ) : null}
        {product.stock <= 0 ? (
          <span className="absolute inset-0 grid place-items-center bg-deep/55 text-xs font-semibold uppercase tracking-[0.2em] text-paper backdrop-blur-[1px]">
            Sin stock
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5">
          <PotencyChips product={product} />
        </div>
        <h3 className="mt-3 text-xl leading-tight text-ink">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
          {product.description || "Ficha en preparación."}
        </p>

        <div className="mt-4">
          <SativaBar product={product} />
        </div>

        {product.aromas.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {product.aromas.slice(0, 4).map((aroma) => (
              <span key={aroma} className="chip">
                {aroma}
              </span>
            ))}
            {product.aromas.length > 4 ? (
              <span className="chip">+{product.aromas.length - 4}</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
              Precio
            </p>
            <p className="mt-0.5 text-lg font-semibold text-ink">
              {product.price > 0 ? formatARS(product.price) : "A confirmar"}
            </p>
          </div>
          <button type="button" onClick={onOpen} className="btn-ghost btn-sm">
            Ver ficha
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={onOpen} className="btn-outline btn-sm">
            <SlidersHorizontal className="size-3.5" />
            Detalle
          </button>
          <AddToCartButton product={product} className="btn-mint btn-sm" />
        </div>
      </div>
    </article>
  );
}

function ProductDetail({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="grid gap-6 sm:grid-cols-[.9fr_1.1fr]">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-ink/5">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="chip border-green/20 bg-mint/20 text-green-text">
            {CATEGORY_LABELS[product.category]}
          </span>
          <span className="chip">
            {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
          </span>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-1.5">
          <PotencyChips product={product} />
        </div>
        <h3 className="mt-3 text-3xl text-ink">{product.name}</h3>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
          {product.description || "Ficha en preparación."}
        </p>

        <div className="mt-5">
          <SativaBar product={product} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoBlock label="Presentación" value={product.presentation || "A definir"} />
          <InfoBlock
            label="Categoría"
            value={CATEGORY_LABELS[product.category]}
          />
        </div>

        {product.aromas.length > 0 ? (
          <TagBlock title="Aromas" items={product.aromas} />
        ) : null}
        {product.flavors.length > 0 ? (
          <TagBlock title="Sabores" items={product.flavors} />
        ) : null}
        {product.effects.length > 0 ? (
          <TagBlock title="Efectos" items={product.effects} />
        ) : null}

        <div className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                Precio
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">
                {product.price > 0 ? formatARS(product.price) : "A confirmar"}
              </p>
            </div>
            <div className="flex items-center rounded-full border border-ink/15 bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="grid size-8 place-items-center rounded-full text-ink transition hover:bg-ink/5 disabled:opacity-40"
                aria-label="Quitar una unidad"
                disabled={quantity <= 1}
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-9 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) =>
                    Math.min(value + 1, product.stock, 99),
                  )
                }
                className="grid size-8 place-items-center rounded-full text-ink transition hover:bg-ink/5 disabled:opacity-40"
                aria-label="Agregar una unidad"
                disabled={quantity >= product.stock || product.stock <= 0}
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <AddToCartButton
              product={product}
              quantity={quantity}
              className="btn-mint w-full"
              label="Agregar al carrito"
            />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            El precio y el stock se validan nuevamente al confirmar el pedido.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost btn-sm mt-2 w-full"
          >
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/55 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function TagBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="chip">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CatalogClient({
  products,
  initialCategory = "todos",
}: {
  products: Product[];
  initialCategory?: Filter;
}) {
  const [filter, setFilter] = useState<Filter>(initialCategory);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (filter === "todos") url.searchParams.delete("categoria");
    else url.searchParams.set("categoria", filter);
    window.history.replaceState(null, "", url.toString());
  }, [filter]);

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      todos: products.length,
      flores: 0,
      rosin_hash: 0,
      vapes: 0,
    };
    for (const product of products) base[product.category] += 1;
    return base;
  }, [products]);

  const filtered = useMemo(() => {
    const normalized = normalizeSearch(deferredSearch);
    return products.filter((product) => {
      if (filter !== "todos" && product.category !== filter) return false;
      if (!normalized) return true;
      return normalizeSearch(
        [
          product.name,
          product.description ?? "",
          product.aromas.join(" "),
          product.flavors.join(" "),
          product.effects.join(" "),
        ].join(" "),
      ).includes(normalized);
    });
  }, [products, filter, deferredSearch]);

  return (
    <div className="space-y-6">
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="hide-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 py-1">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition",
                  filter === item.value
                    ? "bg-ink text-paper shadow-card"
                    : "text-muted hover:bg-ink/5 hover:text-ink",
                )}
              >
                {item.value === "todos" ? (
                  <Sparkles className="size-3.5" />
                ) : (
                  <Leaf className="size-3.5" />
                )}
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px]",
                    filter === item.value ? "bg-mint text-deep" : "bg-ink/10",
                  )}
                >
                  {counts[item.value]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full xl:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar genética, aroma o efecto"
              className="input pl-10 pr-9"
              aria-label="Buscar en el catálogo"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted hover:text-ink"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {filter !== "todos" ? (
          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
            <Beaker className="size-3.5 text-green-text" />
            {CATEGORY_NOTES[filter]}
          </p>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-mint/25 text-green-text">
            <Search className="size-5" />
          </span>
          <h2 className="mt-4 text-xl text-ink">No encontramos resultados</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Probá con otro aroma, genética o cambiá la categoría.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilter("todos");
            }}
            className="btn-outline btn-sm mt-5"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen={() => setSelected(product)}
            />
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        description={
          selected
            ? `${CATEGORY_LABELS[selected.category]} · Ficha privada`
            : undefined
        }
        size="xl"
      >
        {selected ? (
          <ProductDetail
            key={selected.id}
            product={selected}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </Dialog>
    </div>
  );
}
