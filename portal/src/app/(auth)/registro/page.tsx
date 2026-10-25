import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";
import { isSupabaseConfigured } from "@/lib/config";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return (
    <div className="card p-6 sm:p-8">
      <span className="grid size-11 place-items-center rounded-2xl bg-mint/30 text-green-text">
        <UserPlus className="size-5" />
      </span>
      <p className="eyebrow mt-5">Alta de paciente</p>
      <h1 className="mt-2 text-3xl text-ink">Creá tu cuenta</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Necesitamos tus datos de contacto para coordinar pedidos y entregas.
        Podés completar tu perfil más adelante.
      </p>

      <div className="mt-6">
        <RegisterForm configured={isSupabaseConfigured()} />
      </div>
    </div>
  );
}
