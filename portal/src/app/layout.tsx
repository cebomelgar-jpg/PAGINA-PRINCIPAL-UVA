import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { PORTAL_URL } from "@/lib/config";

const righteous = localFont({
  src: "./fonts/righteous-latin.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-righteous",
  display: "swap",
});

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  weight: "300 700",
  style: "normal",
  variable: "--font-space-grotesk",
  display: "swap",
});

const portalUrl = PORTAL_URL;

export const metadata: Metadata = {
  metadataBase: new URL(portalUrl),
  title: {
    default: "Portal de pacientes · Un Viaje Astral",
    template: "%s · Un Viaje Astral",
  },
  description:
    "Espacio privado para pacientes registrados de Un Viaje Astral. Catálogo, pedidos y seguimiento en un entorno seguro.",
  applicationName: "Un Viaje Astral · Portal de pacientes",
  authors: [{ name: "Un Viaje Astral" }],
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Portal de pacientes · Un Viaje Astral",
    description:
      "Acceso privado para pacientes registrados. Catálogo, pedidos y acompañamiento.",
    type: "website",
    locale: "es_AR",
    siteName: "Un Viaje Astral",
    url: portalUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#191b30",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${righteous.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-paper text-ink">
        <a
          href="#contenido"
          className="sr-only z-[200] rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar al contenido
        </a>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
