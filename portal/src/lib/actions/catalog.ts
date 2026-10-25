"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { firstZodError, productSchema } from "@/lib/validation";
import { parseList, parseOptionalNumber, slugify } from "@/lib/utils";
import type { ActionState } from "@/lib/types";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function formNumber(formData: FormData, key: string, fallback = 0) {
  const raw = formString(formData, key).trim().replace(",", ".");
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function revalidateCatalog() {
  revalidatePath("/admin/catalogo");
  revalidatePath("/admin");
  revalidatePath("/portal");
  revalidatePath("/portal/catalogo");
}

export async function saveProductAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = formString(formData, "id").trim();
  if (id && !z.string().uuid().safeParse(id).success) {
    return { error: "El producto que intentás editar no es válido." };
  }

  const name = formString(formData, "name");
  const slug = formString(formData, "slug").trim() || slugify(name);

  const parsed = productSchema.safeParse({
    name,
    slug,
    category: formString(formData, "category"),
    description: formString(formData, "description"),
    thc: formString(formData, "thc"),
    cbd: formString(formData, "cbd"),
    sativa_percent: parseOptionalNumber(formData.get("sativa_percent")),
    indica_percent: parseOptionalNumber(formData.get("indica_percent")),
    aromas: parseList(formData.get("aromas")),
    flavors: parseList(formData.get("flavors")),
    effects: parseList(formData.get("effects")),
    price: formNumber(formData, "price"),
    stock: formNumber(formData, "stock"),
    presentation: formString(formData, "presentation"),
    image_url: formString(formData, "image_url"),
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
    sort_order: formNumber(formData, "sort_order"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const data = parsed.data;

  if (
    data.sativa_percent !== null &&
    data.indica_percent !== null &&
    data.sativa_percent + data.indica_percent > 100
  ) {
    return {
      error: "La suma de sativa e indica no puede superar el 100%.",
    };
  }

  if (data.active && data.price <= 0) {
    return {
      error: "Para publicar el producto asigná un precio mayor a cero.",
    };
  }

  const payload = {
    name: data.name,
    slug: data.slug,
    category: data.category,
    description: data.description || null,
    thc: data.thc || null,
    cbd: data.cbd || null,
    sativa_percent: data.sativa_percent,
    indica_percent: data.indica_percent,
    aromas: data.aromas,
    flavors: data.flavors,
    effects: data.effects,
    price: data.price,
    stock: data.stock,
    presentation: data.presentation || null,
    image_url: data.image_url || null,
    active: data.active,
    featured: data.featured,
    sort_order: data.sort_order,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("products").update(payload).eq("id", id)
    : await supabase.from("products").insert(payload);

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un producto con ese slug." };
    }
    return { error: "No pudimos guardar el producto. Intentá nuevamente." };
  }

  revalidateCatalog();
  redirect("/admin/catalogo?guardado=1");
}

export async function updateStockAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const productId = formString(formData, "productId");
  const stock = formNumber(formData, "stock", -1);

  if (!z.string().uuid().safeParse(productId).success) {
    return { error: "Producto inválido." };
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 100_000) {
    return { error: "El stock debe ser un número entre 0 y 100.000." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ stock })
    .eq("id", productId);

  if (error) {
    return { error: "No pudimos actualizar el stock." };
  }

  revalidateCatalog();
  return { message: "Stock actualizado." };
}

export async function toggleProductActiveAction(formData: FormData) {
  await requireAdmin();
  const productId = formString(formData, "productId");
  const active = formString(formData, "active") === "true";

  if (!z.string().uuid().safeParse(productId).success) return;

  const supabase = await createClient();

  if (active) {
    const { data: product } = await supabase
      .from("products")
      .select("price")
      .eq("id", productId)
      .maybeSingle();

    if (!product || Number(product.price) <= 0) {
      redirect(
        "/admin/catalogo?error=Asign%C3%A1+un+precio+mayor+a+cero+antes+de+publicar.",
      );
    }
  }

  const { error } = await supabase
    .from("products")
    .update({ active })
    .eq("id", productId);

  if (error) {
    redirect("/admin/catalogo?error=No pudimos cambiar la visibilidad.");
  }

  revalidateCatalog();
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const productId = formString(formData, "productId");

  if (!z.string().uuid().safeParse(productId).success) {
    redirect("/admin/catalogo?error=Producto inválido.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    redirect("/admin/catalogo?error=No pudimos eliminar el producto.");
  }

  revalidateCatalog();
  redirect("/admin/catalogo?eliminado=1");
}
