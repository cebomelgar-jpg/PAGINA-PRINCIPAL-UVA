import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/portal";
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    return NextResponse.redirect(
      new URL("/login?error=callback", origin),
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, origin));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      console.error(`[auth/callback] No se pudo canjear el código: ${message}`);
    }
  }

  return NextResponse.redirect(new URL("/login?error=callback", origin));
}
