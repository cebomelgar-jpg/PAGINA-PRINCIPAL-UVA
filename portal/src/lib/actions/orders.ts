"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth";
import {
  checkoutSchema,
  firstZodError,
  orderNoteSchema,
  orderStatusSchema,
} from "@/lib/validation";

type ActionResult = { ok: true } | { ok: false; error: string };

function rpcError(message?: string) {
  if (!message) return "No pudimos completar la operación. Intentá nuevamente.";
  const known = [
    "Stock insuficiente",
    "ya no está disponible",
    "carrito está vacío",
    "total del pedido",
    "teléfono de contacto",
    "dirección para la entrega",
    "Solo podés cancelar",
    "pedido cancelado",
    "permisos de administrador",
    "perfil de paciente",
  ];
  if (known.some((fragment) => message.includes(fragment))) return message;
  return "No pudimos completar la operación. Intentá nuevamente.";
}

export async function createOrderAction(input: unknown) {
  const user = await requireUser();
  const parsed = checkoutSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: firstZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_order", {
    p_items: parsed.data.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
    p_payment_method: parsed.data.paymentMethod,
    p_fulfillment_method: parsed.data.fulfillmentMethod,
    p_contact_phone: parsed.data.contactPhone,
    p_delivery_address: parsed.data.deliveryAddress || null,
    p_notes: parsed.data.notes || null,
    p_therapeutic_notes: parsed.data.therapeuticNotes || null,
  });

  if (error) {
    return { ok: false as const, error: rpcError(error.message) };
  }

  revalidatePath("/portal");
  revalidatePath("/portal/pedidos");
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/analiticas");

  return { ok: true as const, orderId: data as string, userId: user.id };
}

export async function cancelOrderAction(orderId: string): Promise<ActionResult> {
  const parsed = z.string().uuid().safeParse(orderId);
  if (!parsed.success) {
    return { ok: false, error: "Pedido inválido." };
  }

  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_order", {
    p_order_id: parsed.data,
  });

  if (error) {
    return { ok: false, error: rpcError(error.message) };
  }

  revalidatePath("/portal");
  revalidatePath("/portal/pedidos");
  revalidatePath(`/portal/pedidos/${parsed.data}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/analiticas");
  return { ok: true };
}

export async function updateOrderStatusAction(
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = orderStatusSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_order_status", {
    p_order_id: parsed.data.orderId,
    p_status: parsed.data.status,
    p_payment_status: parsed.data.paymentStatus,
  });

  if (error) {
    return { ok: false, error: rpcError(error.message) };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/analiticas");
  revalidatePath("/portal/pedidos");
  revalidatePath(`/portal/pedidos/${parsed.data.orderId}`);
  return { ok: true };
}

export async function saveOrderNotesAction(
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = orderNoteSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ admin_notes: parsed.data.adminNotes || null })
    .eq("id", parsed.data.orderId);

  if (error) {
    return {
      ok: false,
      error: "No pudimos guardar la nota interna. Intentá nuevamente.",
    };
  }

  revalidatePath("/admin/pedidos");
  return { ok: true };
}
