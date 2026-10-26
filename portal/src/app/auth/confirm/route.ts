import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/portal";
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));

  if (tokenHash && type) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });

      if (!error) {
        return NextResponse.redirect(new URL(next, origin));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      console.error(`[auth/confirm] No se pudo verificar el enlace: ${message}`);
    }
  }

  return NextResponse.redirect(new URL("/login?error=callback", origin));
}
