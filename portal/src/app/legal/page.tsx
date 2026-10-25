import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { CONTACT } from "@/lib/config";

export const metadata: Metadata = {
  title: "Condiciones y privacidad",
};

export default function LegalPage() {
  return (
    <div className="portal-canvas min-h-screen">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
        <Link href="/" className="btn-ghost btn-sm">
          <ArrowLeft className="size-3.5" />
          Volver
        </Link>
      </header>

      <main id="contenido" className="mx-auto w-full max-w-4xl px-5 pb-20 sm:px-8">
        <div className="card p-6 sm:p-10">
          <p className="eyebrow">Información legal</p>
          <h1 className="mt-3 text-3xl text-ink sm:text-4xl">
            Condiciones de uso y privacidad
          </h1>
          <p className="mt-3 text-sm text-muted">
            Última actualización: octubre de 2026.
          </p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted">
            <section>
              <h2 className="text-xl text-ink">1. Espacio privado</h2>
              <p className="mt-2">
                El portal de pacientes de Un Viaje Astral es un servicio
                complementario para personas registradas mayores de 18 años.
                El acceso es personal e intransferible. La información
                publicada no reemplaza la consulta ni la indicación de un
                profesional de la salud.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-ink">2. Datos que registramos</h2>
              <p className="mt-2">
                Para crear la cuenta guardamos nombre, email, teléfono y rol de
                acceso. Al realizar un pedido guardamos los productos, el total,
                el método de pago elegido, el teléfono de contacto, la dirección
                de entrega si corresponde y las notas que decidas compartir,
                incluidas tus necesidades terapéuticas.
              </p>
              <p className="mt-2">
                No solicitamos información médica más allá de lo necesario para
                coordinar el pedido. Evitá incluir datos sensibles que no sean
                relevantes.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-ink">3. Para qué usamos los datos</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Crear y proteger tu cuenta.</li>
                <li>Gestionar el catálogo, los pedidos y las entregas.</li>
                <li>Coordinar el pago y comunicarnos con vos.</li>
                <li>Controlar stock y emitir reportes internos agregados.</li>
              </ul>
              <p className="mt-2">
                No vendemos ni cedemos tus datos a terceros ajenos a la
                operación del portal.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-ink">4. Quién puede ver tus datos</h2>
              <p className="mt-2">
                Cada paciente puede ver únicamente su perfil, sus pedidos y el
                detalle de esos pedidos. El administrador del portal puede ver
                el conjunto de pedidos para gestionar stock, pagos y despacho.
                La base de datos aplica reglas de seguridad a nivel de fila.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-ink">5. Conservación y seguridad</h2>
              <p className="mt-2">
                Los datos se alojan en Supabase con sesiones protegidas y
                conexiones cifradas. Conservamos el historial de pedidos
                mientras sea necesario para la operación y las obligaciones
                aplicables. Podés solicitar la eliminación de tu cuenta
                escribiendo a {CONTACT.email}; algunos registros contables o de
                seguridad pueden conservarse por un plazo razonable.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-ink">6. Pagos</h2>
              <p className="mt-2">
                El portal no procesa pagos con tarjeta. Los pedidos se abonan en
                efectivo o por transferencia bancaria según las instrucciones
                que se muestran al confirmar. El equipo valida el pago antes de
                despachar.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-ink">7. Tus derechos</h2>
              <p className="mt-2">
                Podés solicitar acceso, rectificación o eliminación de tus datos
                personales, o pedir la baja del portal, escribiendo a{" "}
                <a className="link-underline" href={`mailto:${CONTACT.email}`}>
                  {CONTACT.email}
                </a>{" "}
                o por WhatsApp al {CONTACT.whatsapp}. Responderemos dentro de un
                plazo razonable.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-ink">8. Cambios</h2>
              <p className="mt-2">
                Podemos actualizar estas condiciones para reflejar cambios
                operativos o legales. La versión vigente estará siempre
                publicada en esta página.
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-2 border-t border-ink/10 pt-6">
            <Link href="/registro" className="btn-primary btn-sm">
              Crear cuenta
            </Link>
            <Link href="/login" className="btn-outline btn-sm">
              Ingresar
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
