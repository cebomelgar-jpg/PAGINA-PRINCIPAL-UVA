import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  LockKeyhole,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { MAIN_SITE_URL, whatsappUrl } from "@/lib/config";

const categories = [
  {
    title: "Flores secas",
    description: "Genéticas seleccionadas, con ficha de cannabinoides y aromas.",
    image: "/products/runtz.webp",
    alt: "Flores secas de Runtz",
  },
  {
    title: "Rosin Hash",
    description: "Extracciones sin solventes, de alta pureza y cuidado.",
    image: "/products/rosin-hash.webp",
    alt: "Rosin Hash de Un Viaje Astral",
  },
  {
    title: "Vapes",
    description: "Formatos de vaporización para acompañar tu tratamiento.",
    image: "/products/vape-placeholder.svg",
    alt: "Ilustración de un vape",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 portal-canvas" />
      <div className="pointer-events-none absolute inset-0 grain" />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Logo priority />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          <a href="#experiencia" className="transition hover:text-ink">
            La experiencia
          </a>
          <a href="#categorias" className="transition hover:text-ink">
            Catálogo
          </a>
          <a href="#seguridad" className="transition hover:text-ink">
            Privacidad
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="btn-ghost btn-sm hidden sm:inline-flex"
          >
            Ingresar
          </Link>
          <Link href="/registro" className="btn-primary btn-sm">
            Crear cuenta
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      <main id="contenido" className="relative z-10">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-28 lg:pt-16">
          <div className="animate-fade-up">
            <p className="eyebrow flex items-center gap-2">
              <Sparkles className="size-3.5" />
              Portal privado para pacientes
            </p>
            <h1 className="mt-5 max-w-3xl text-[clamp(2.7rem,6vw,5.6rem)] font-normal leading-[0.95] tracking-tight text-ink">
              Tu medicina,
              <span className="block text-purple">en un espacio privado.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Un Viaje Astral abre su portal exclusivo para pacientes
              registrados. Consultá el catálogo, armá tu pedido y coordiná la
              entrega con el equipo en un entorno cuidado.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/registro" className="btn-primary">
                Registrarme
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className="btn-outline">
                Ya tengo cuenta
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="chip">
                <LockKeyhole className="size-3.5 text-green-text" />
                Acceso privado
              </span>
              <span className="chip">
                <ShieldCheck className="size-3.5 text-green-text" />
                Datos protegidos
              </span>
              <span className="chip">+18 · Socios registrados</span>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-mint/50 via-purple-light/20 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/50 bg-ink shadow-soft">
              <Image
                src="/brand/hero.webp"
                alt="Composición visual de Un Viaje Astral"
                width={920}
                height={1040}
                priority
                className="h-[26rem] w-full object-cover opacity-90 sm:h-[32rem]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-mint">
                  Catálogo privado
                </p>
                <p className="mt-2 max-w-sm font-display text-2xl leading-tight text-paper">
                  Flores, rosin y vapes en un mismo lugar.
                </p>
                <div className="mt-5 flex items-center gap-3 text-xs text-paper/75">
                  <span className="status-dot" />
                  Pedidos coordinados con el equipo
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-3 hidden max-w-[15rem] rounded-2xl border border-ink/10 bg-white/90 p-4 shadow-card backdrop-blur sm:block">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-mint/30 text-green-text">
                  <PackageCheck className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink">
                    Seguimiento claro
                  </p>
                  <p className="text-[11px] text-muted">
                    Estado de cada pedido
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="experiencia"
          className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Cómo funciona</p>
              <h2 className="mt-2 text-3xl text-ink sm:text-4xl">
                Un recorrido simple y reservado.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted">
              El portal está pensado para pacientes de la asociación. El
              catálogo se habilita según disponibilidad y cada pedido es
              revisado por el equipo.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Creá tu cuenta",
                text: "Registrate con tus datos de contacto. El acceso es personal y requiere confirmar tu email.",
                icon: <LockKeyhole className="size-4" />,
              },
              {
                number: "02",
                title: "Elegí tus productos",
                text: "Consultá fichas, cannabinoides, aromas y stock. Armá el carrito a tu ritmo.",
                icon: <Leaf className="size-4" />,
              },
              {
                number: "03",
                title: "Confirmá el pedido",
                text: "Elegí efectivo o transferencia y coordiná la entrega. El equipo valida stock y pago.",
                icon: <PackageCheck className="size-4" />,
              },
            ].map((item) => (
              <article key={item.number} className="card p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-2xl bg-mint/25 text-green-text">
                    {item.icon}
                  </span>
                  <span className="font-display text-2xl text-ink/15">
                    {item.number}
                  </span>
                </div>
                <h3 className="mt-5 text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="categorias"
          className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Tres familias</p>
              <h2 className="mt-2 text-3xl text-ink sm:text-4xl">
                El catálogo, organizado.
              </h2>
            </div>
            <Link href="/login" className="link-underline inline-flex items-center gap-1 text-sm">
              Ver catálogo privado
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.title}
                href="/login"
                className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-ink shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft"
              >
                <Image
                  src={category.image}
                  alt={category.alt}
                  width={700}
                  height={560}
                  className="h-64 w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-xl text-paper">{category.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-paper/70">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          id="seguridad"
          className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8"
        >
          <div className="card-dark relative overflow-hidden p-7 sm:p-10">
            <div className="absolute -right-24 -top-24 size-72 rounded-full bg-mint/10 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-mint">
                  Privacidad por diseño
                </p>
                <h2 className="mt-3 text-3xl text-paper sm:text-4xl">
                  Tu información no es parte del escaparate.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-paper/70">
                  El portal no se indexa en buscadores. Las cuentas, los pedidos
                  y las notas de cada paciente se separan por reglas de acceso
                  en la base de datos. Solo el administrador puede ver el
                  conjunto de pedidos para gestionar stock y despacho.
                </p>
              </div>
              <ul className="grid gap-3 text-sm text-paper/80">
                {[
                  "Sesiones con cookies seguras y refresco automático.",
                  "Cada paciente ve únicamente sus propios pedidos.",
                  "Precios y stock recalculados en el servidor al confirmar.",
                  "Datos de pago coordinados de forma privada.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-ink/10 bg-white/70 p-7 shadow-card sm:flex-row sm:items-center sm:p-9">
            <div>
              <p className="eyebrow">¿Ya sos paciente?</p>
              <h2 className="mt-2 text-2xl text-ink sm:text-3xl">
                Ingresá con tu cuenta.
              </h2>
              <p className="mt-2 text-sm text-muted">
                Si todavía no tenés acceso, escribinos y coordinamos tu alta.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/login" className="btn-primary">
                Ingresar al portal
                <ArrowRight className="size-4" />
              </Link>
              <a
                href={whatsappUrl("Hola, quiero registrarme en el portal de pacientes de Un Viaje Astral.")}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-ink/10 bg-white/50">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <Logo imageClassName="h-8" />
            <span>© {new Date().getFullYear()} Un Viaje Astral</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={MAIN_SITE_URL}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-ink"
            >
              Sitio principal
            </a>
            <Link href="/registro" className="transition hover:text-ink">
              Crear cuenta
            </Link>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-ink"
            >
              Contacto
            </a>
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-5 pb-8 text-[10px] leading-relaxed text-muted/80 sm:px-8">
          Espacio exclusivo para pacientes registrados mayores de 18 años. La
          información del portal no reemplaza la indicación de un profesional
          de la salud. Productos sujetos a disponibilidad y a la legislación
          vigente.
        </div>
      </footer>
    </div>
  );
}
