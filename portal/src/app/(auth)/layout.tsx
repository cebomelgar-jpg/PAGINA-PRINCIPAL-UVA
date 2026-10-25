import Link from "next/link";
import { ArrowLeft, Leaf, LockKeyhole, ShieldCheck } from "lucide-react";
import { MAIN_SITE_URL } from "@/lib/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-10 text-paper lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/brand/pattern.webp')" }}
          />
        </div>
        <div className="pointer-events-none absolute -left-24 top-1/3 size-72 rounded-full bg-mint/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full bg-purple-light/20 blur-3xl" />

        <div className="relative">
          <Link href="/" className="inline-flex flex-col">
            <span className="font-display text-2xl leading-none text-paper">
              Un Viaje Astral
            </span>
            <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-mint">
              Portal de pacientes
            </span>
          </Link>

          <h1 className="mt-16 max-w-md text-4xl leading-[1.05] text-paper">
            Un espacio reservado para acompañar tu recorrido.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/65">
            Catálogo privado, pedidos y seguimiento en un mismo lugar. El acceso
            es personal y está protegido con reglas de seguridad en la base de
            datos.
          </p>

          <ul className="mt-10 space-y-4 text-sm text-paper/75">
            {[
              { icon: <LockKeyhole className="size-4" />, text: "Acceso exclusivo para pacientes registrados." },
              { icon: <Leaf className="size-4" />, text: "Fichas con cannabinoides, aromas y stock." },
              { icon: <ShieldCheck className="size-4" />, text: "Tus pedidos solo los ves vos y el equipo." },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-xl bg-white/8 text-mint">
                  {item.icon}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between gap-4 text-[11px] text-paper/45">
          <a
            href={MAIN_SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-paper"
          >
            <ArrowLeft className="size-3.5" />
            Volver al sitio principal
          </a>
          <span>+18 · Uso privado</span>
        </div>
      </aside>

      <main
        id="contenido"
        className="portal-canvas relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8"
      >
        <div className="pointer-events-none absolute inset-0 grain" />
        <div className="relative w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="font-display text-xl text-ink">
              Un Viaje Astral
            </Link>
            <a
              href={MAIN_SITE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted transition hover:text-ink"
            >
              Sitio principal
            </a>
          </div>
          {children}
          <p className="mt-8 text-center text-[10px] leading-relaxed text-muted/80">
            Espacio exclusivo para mayores de 18 años. La información del portal
            no reemplaza la indicación de un profesional de la salud.
          </p>
        </div>
      </main>
    </div>
  );
}
