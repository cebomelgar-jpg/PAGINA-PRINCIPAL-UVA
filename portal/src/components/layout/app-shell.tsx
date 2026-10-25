"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  ShoppingBag,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useCart } from "@/components/providers/cart-provider";
import { signOutAction } from "@/lib/actions/auth";
import { whatsappUrl } from "@/lib/config";
import type { Profile } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  exact?: boolean;
};

export function AppShell({
  profile,
  mode,
  children,
}: {
  profile: Profile;
  mode: "portal" | "admin";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const portalNav: NavItem[] = [
    { href: "/portal", label: "Resumen", icon: <LayoutDashboard className="size-4" />, exact: true },
    { href: "/portal/catalogo", label: "Catálogo", icon: <Leaf className="size-4" /> },
    {
      href: "/portal/carrito",
      label: "Carrito",
      icon: <ShoppingBag className="size-4" />,
      badge: totalItems,
    },
    { href: "/portal/pedidos", label: "Mis pedidos", icon: <Package className="size-4" /> },
    { href: "/portal/perfil", label: "Mi perfil", icon: <UserRound className="size-4" /> },
  ];

  const adminNav: NavItem[] = [
    { href: "/admin", label: "Resumen", icon: <LayoutDashboard className="size-4" />, exact: true },
    { href: "/admin/pedidos", label: "Pedidos", icon: <ClipboardList className="size-4" /> },
    { href: "/admin/catalogo", label: "Catálogo", icon: <Boxes className="size-4" /> },
    { href: "/admin/analiticas", label: "Analíticas", icon: <BarChart3 className="size-4" /> },
  ];

  const nav = mode === "admin" ? adminNav : portalNav;

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const navContent = (
    <>
      <div className="px-1">
        <Logo href={mode === "admin" ? "/admin" : "/portal"} />
      </div>

      <nav className="mt-8 space-y-1" aria-label={mode === "admin" ? "Administración" : "Portal"}>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition",
              isActive(item)
                ? "bg-ink text-paper shadow-card"
                : "text-muted hover:bg-ink/5 hover:text-ink",
            )}
          >
            <span
              className={cn(
                "transition",
                isActive(item) ? "text-mint" : "text-muted group-hover:text-green-text",
              )}
            >
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span
                key={item.badge}
                className={cn(
                  "grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold animate-cart-bump",
                  isActive(item)
                    ? "bg-mint text-deep"
                    : "bg-ink/10 text-ink",
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="mt-6 space-y-1 border-t border-ink/10 pt-6">
        {mode === "portal" && profile.role === "admin" ? (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-purple transition hover:bg-purple/5"
          >
            <Store className="size-4" />
            Administración
          </Link>
        ) : null}
        {mode === "admin" ? (
          <Link
            href="/portal"
            className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-green-text transition hover:bg-green/5"
          >
            <Leaf className="size-4" />
            Ver portal de paciente
          </Link>
        ) : null}
        <a
          href={whatsappUrl("Hola, necesito ayuda con mi cuenta del portal de Un Viaje Astral.")}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-muted transition hover:bg-ink/5 hover:text-ink"
        >
          <MessageCircle className="size-4" />
          Ayuda por WhatsApp
        </a>
      </div>

      <div className="mt-auto pt-8">
        <div className="rounded-2xl border border-ink/10 bg-white/70 p-3.5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-mint">
              {initials(profile.full_name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {profile.full_name}
              </p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {profile.role === "admin" ? "Administrador" : "Paciente"}
              </p>
            </div>
          </div>
          <form action={signOutAction} className="mt-3">
            <button type="submit" className="btn-outline btn-sm w-full">
              <LogOut className="size-3.5" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <div className="portal-canvas min-h-screen">
      <div className="pointer-events-none fixed inset-0 grain" />

      <header className="no-print sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-ink/10 bg-paper/85 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="grid size-10 place-items-center rounded-xl border border-ink/10 bg-white/70 text-ink"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>
        <Logo href={mode === "admin" ? "/admin" : "/portal"} imageClassName="h-8" />
        <Link
          href={mode === "admin" ? "/admin/pedidos" : "/portal/carrito"}
          className="relative grid size-10 place-items-center rounded-xl border border-ink/10 bg-white/70 text-ink"
          aria-label={mode === "admin" ? "Ir a pedidos" : "Ir al carrito"}
        >
          {mode === "admin" ? <ClipboardList className="size-5" /> : <ShoppingBag className="size-5" />}
          {mode === "portal" && totalItems > 0 ? (
            <span
              key={totalItems}
              className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-green px-1 py-0.5 text-[9px] font-bold text-white animate-cart-bump"
            >
              {totalItems}
            </span>
          ) : null}
        </Link>
      </header>

      <div className="relative mx-auto flex w-full max-w-[1600px]">
        <aside className="no-print sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col border-r border-ink/10 bg-paper/55 px-4 py-6 backdrop-blur lg:flex">
          {navContent}
        </aside>

        {menuOpen ? (
          <div className="no-print fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-deep/60 backdrop-blur-sm"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
            />
            <div className="relative flex h-full w-[min(20rem,88vw)] flex-col overflow-y-auto bg-paper px-4 py-5 shadow-soft animate-fade-in">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-ink/5 text-ink"
                aria-label="Cerrar menú"
              >
                <X className="size-4" />
              </button>
              {navContent}
            </div>
          </div>
        ) : null}

        <main
          id="contenido"
          className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
