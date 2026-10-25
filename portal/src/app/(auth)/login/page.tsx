import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, LockKeyhole, LogOut } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { signOutAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/config";

export const metadata: Metadata = {
  title: "Ingresar",
};

const errorMessages: Record<string, string> = {
  callback:
    "El enlace de confirmación no es válido o venció. Probá iniciar sesión o registrarte nuevamente.",
  profile:
    "Tu cuenta existe pero no encontramos tu perfil. Escribinos para resolverlo.",
  forbidden: "No tenés permisos para acceder a esa sección.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <div className="card p-6 sm:p-8">
      <span className="grid size-11 place-items-center rounded-2xl bg-ink text-mint">
        <LockKeyhole className="size-5" />
      </span>
      <p className="eyebrow mt-5">Acceso privado</p>
      <h1 className="mt-2 text-3xl text-ink">Ingresá a tu portal</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Usá el email y la contraseña con los que te registraste.
      </p>

      {errorMessage ? (
        <div className="mt-5 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {params.error === "profile" ? (
        <form action={signOutAction} className="mt-3">
          <button type="submit" className="btn-outline btn-sm">
            <LogOut className="size-3.5" />
            Cerrar sesión y volver a intentar
          </button>
        </form>
      ) : null}

      <div className="mt-6">
        <LoginForm
          nextPath={params.next}
          configured={isSupabaseConfigured()}
        />
      </div>

      <div className="mt-6 border-t border-ink/10 pt-5 text-center text-xs text-muted">
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/registro" className="font-semibold text-green-text hover:underline">
          Registrate
        </Link>
      </div>
    </div>
  );
}
