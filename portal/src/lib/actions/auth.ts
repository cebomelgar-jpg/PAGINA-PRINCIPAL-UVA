"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import {
  firstZodError,
  loginSchema,
  profileSchema,
  registerSchema,
} from "@/lib/validation";
import type { ActionState } from "@/lib/types";

function safeNext(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/portal";
  if (!value.startsWith("/") || value.startsWith("//")) return "/portal";
  return value;
}

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        error:
          "Tu email todavía no está confirmado. Revisá tu bandeja de entrada o pedí un nuevo enlace.",
      };
    }
    return { error: "Email o contraseña incorrectos." };
  }

  redirect(safeNext(formData.get("next")));
}

export async function registerAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms"),
    isAdult: formData.get("isAdult"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ||
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
      },
      emailRedirectTo: new URL("/auth/callback?next=/portal", origin).toString(),
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return {
        error:
          "Ese email ya tiene una cuenta. Probá iniciar sesión o escribinos por WhatsApp para recuperar el acceso.",
      };
    }
    return {
      error:
        "No pudimos crear la cuenta. Revisá los datos e intentá nuevamente.",
    };
  }

  if (data.session) {
    redirect("/portal");
  }

  return {
    message:
      "Cuenta creada. Te enviamos un email para confirmar tu dirección. Revisá también la carpeta de spam.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateProfileAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "No pudimos actualizar tus datos. Intentá nuevamente." };
  }

  revalidatePath("/portal", "layout");
  revalidatePath("/portal/perfil");
  return { message: "Tus datos se actualizaron correctamente." };
}
