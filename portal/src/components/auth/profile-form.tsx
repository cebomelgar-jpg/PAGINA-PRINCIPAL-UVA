"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { updateProfileAction } from "@/lib/actions/auth";
import type { ActionState, Profile } from "@/lib/types";

const initialState: ActionState = {};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <div
          role="alert"
          className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-800"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{state.error}</p>
        </div>
      ) : null}

      {state.message ? (
        <div
          role="status"
          className="flex gap-3 rounded-2xl border border-green/25 bg-mint/20 p-4 text-xs leading-relaxed text-green-text"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div>
        <label htmlFor="fullName" className="label">
          Nombre y apellido
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          defaultValue={profile.full_name}
          className="input"
          required
          minLength={2}
          maxLength={80}
        />
        <p className="mt-1.5 text-[11px] text-muted">
          Este nombre aparece en tus pedidos y en la coordinación con el equipo.
        </p>
      </div>

      <div>
        <label htmlFor="phone" className="label">
          Teléfono de contacto
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={profile.phone ?? ""}
          className="input"
          required
          minLength={6}
          maxLength={30}
          placeholder="Ej. 343 400 0000"
        />
        <p className="mt-1.5 text-[11px] text-muted">
          Lo usamos para coordinar entregas y pagos. Podés actualizarlo cuando
          quieras.
        </p>
      </div>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Guardando…
          </>
        ) : (
          <>
            <Save className="size-4" />
            Guardar cambios
          </>
        )}
      </button>
    </form>
  );
}
