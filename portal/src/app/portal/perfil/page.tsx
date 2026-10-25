import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  FileText,
  KeyRound,
  Mail,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileForm } from "@/components/auth/profile-form";
import { requireProfile, getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { whatsappUrl } from "@/lib/config";
import { initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mi perfil",
};

export default async function ProfilePage() {
  const profile = await requireProfile();
  const user = await getCurrentUser();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Cuenta privada"
        title="Mi perfil"
        description="Mantené actualizados tus datos de contacto. El email de acceso no se puede modificar desde el portal."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-4 border-b border-ink/10 pb-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ink text-sm font-bold text-mint">
              {initials(profile.full_name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-ink">
                {profile.full_name}
              </p>
              <p className="text-xs text-muted">
                {profile.role === "admin" ? "Administrador" : "Paciente"}{" "}
                <span className="mx-1">·</span> Miembro desde{" "}
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <ProfileForm profile={profile} />
          </div>
        </section>

        <aside className="space-y-5">
          <section className="card p-5">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-green-text" />
              <h2 className="text-lg text-ink">Datos de la cuenta</h2>
            </div>
            <div className="mt-4 space-y-4 text-xs">
              <div className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-muted" />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">Email de acceso</p>
                  <p className="truncate text-muted">{user?.email ?? "—"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-muted" />
                <div>
                  <p className="font-semibold text-ink">Rol</p>
                  <p className="text-muted">
                    {profile.role === "admin"
                      ? "Administrador del portal"
                      : "Paciente registrado"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted" />
                <div>
                  <p className="font-semibold text-ink">Alta</p>
                  <p className="text-muted">{formatDate(profile.created_at)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-green-text" />
              <h2 className="text-lg text-ink">Privacidad y seguridad</h2>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
              <li>Tu perfil y tus pedidos solo los ve el equipo administrativo.</li>
              <li>La sesión se cierra automáticamente si el enlace vence.</li>
              <li>No compartas tu contraseña ni accedas desde equipos públicos.</li>
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/legal" className="btn-outline btn-sm">
                <FileText className="size-3.5" />
                Condiciones y privacidad
              </Link>
              <a
                href={whatsappUrl(
                  "Hola, necesito ayuda con mi cuenta del portal de pacientes.",
                )}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost btn-sm"
              >
                <MessageCircle className="size-3.5" />
                Ayuda con mi cuenta
              </a>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/50 p-4 text-[11px] leading-relaxed text-muted">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <KeyRound className="size-3.5 text-green-text" />
              ¿Olvidaste tu contraseña?
            </div>
            <p className="mt-1">
              Por seguridad, la recuperación se coordina con el equipo. Escribinos
              por WhatsApp y te ayudamos a restablecer el acceso.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
