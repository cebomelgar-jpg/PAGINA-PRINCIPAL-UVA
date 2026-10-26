import { NextResponse, type NextRequest } from "next/server";
import { updateSession, type SessionUpdate } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/portal", "/admin"];
const PRIVATE_RESPONSE_HEADERS = ["cache-control", "expires", "pragma"];

function isPathWithin(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => isPathWithin(pathname, prefix));
}

function getPathname(request: NextRequest) {
  try {
    return request.nextUrl.pathname;
  } catch {
    try {
      return new URL(request.url).pathname;
    } catch {
      return "/";
    }
  }
}

function logMiddlewareError(context: string, error: unknown) {
  const message =
    error instanceof Error ? error.message : "Error desconocido en middleware";
  console.error(`[middleware] ${context}: ${message}`);
}

function safeNextResponse(request: NextRequest) {
  try {
    return NextResponse.next({ request });
  } catch {
    return NextResponse.next();
  }
}

function copyPrivateHeaders(from: NextResponse, to: NextResponse) {
  PRIVATE_RESPONSE_HEADERS.forEach((header) => {
    const value = from.headers.get(header);
    if (value) to.headers.set(header, value);
  });
}

function redirectWithSession(url: URL, sessionResponse: NextResponse) {
  const redirect = NextResponse.redirect(url);

  try {
    sessionResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    copyPrivateHeaders(sessionResponse, redirect);
  } catch (error) {
    // Aunque falle la copia de cookies, la redirección debe completarse.
    logMiddlewareError("No se pudieron copiar las cookies al redirect", error);
  }

  return redirect;
}

function loginUrl(
  request: NextRequest,
  pathname: string,
  reason?: "unavailable",
) {
  let url: URL;

  try {
    url = request.nextUrl.clone();
  } catch {
    url = new URL("/login", request.url);
  }

  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", pathname);
  if (reason) url.searchParams.set("error", reason);

  return url;
}

function redirectToLogin(
  request: NextRequest,
  pathname: string,
  reason?: "unavailable",
  sessionResponse?: NextResponse,
) {
  const url = loginUrl(request, pathname, reason);

  if (sessionResponse) {
    return redirectWithSession(url, sessionResponse);
  }

  return NextResponse.redirect(url);
}

async function handleAuthenticatedRequest(
  request: NextRequest,
  session: SessionUpdate,
  pathname: string,
) {
  const { supabase, response, user } = session;

  if (!user) {
    if (isProtectedPath(pathname)) {
      return redirectToLogin(request, pathname, undefined, response);
    }
    return response;
  }

  // Un usuario autenticado sin perfil debe poder ver el error y cerrar sesión.
  // Sin esta excepción, /login lo redirige a /portal y /portal vuelve a /login.
  const profileError =
    pathname === "/login" &&
    request.nextUrl.searchParams.get("error") === "profile";

  if (!profileError && (pathname === "/login" || pathname === "/registro")) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal";
    url.search = "";
    return redirectWithSession(url, response);
  }

  if (isPathWithin(pathname, "/admin")) {
    if (!supabase) {
      return redirectToLogin(request, pathname, "unavailable", response);
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      logMiddlewareError("No se pudo comprobar el rol del administrador", error);
    }

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      url.search = "";
      url.searchParams.set("error", "forbidden");
      return redirectWithSession(url, response);
    }
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = getPathname(request);
  const protectedRoute = isProtectedPath(pathname);

  try {
    const session = await updateSession(request);

    if (session.failed) {
      if (protectedRoute) {
        return redirectToLogin(
          request,
          pathname,
          "unavailable",
          session.response,
        );
      }

      return session.response;
    }

    return await handleAuthenticatedRequest(request, session, pathname);
  } catch (error) {
    // Última barrera: ninguna excepción del middleware debe convertirse en 500.
    logMiddlewareError("Error inesperado al procesar la request", error);

    if (protectedRoute) {
      return redirectToLogin(request, pathname, "unavailable");
    }

    return safeNextResponse(request);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2|txt|xml)$).*)",
  ],
};
