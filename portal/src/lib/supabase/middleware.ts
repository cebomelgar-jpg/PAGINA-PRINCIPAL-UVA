import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

const SUPABASE_TIMEOUT_MS = 6_000;

const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

  if (init?.signal) {
    if (init.signal.aborted) {
      controller.abort();
    } else {
      init.signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }

  let requestPromise: Promise<Response>;

  try {
    requestPromise = fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }

  return requestPromise.finally(() => {
    clearTimeout(timeout);
  });
};

type MiddlewareSupabaseClient = ReturnType<typeof createServerClient>;

export type SessionUpdate = {
  supabase: MiddlewareSupabaseClient | null;
  response: NextResponse;
  user: User | null;
  failed: boolean;
};

function logMiddlewareError(context: string, error: unknown) {
  const message =
    error instanceof Error ? error.message : "Error desconocido en middleware";
  console.error(`[supabase/middleware] ${context}: ${message}`);
}

function nextResponse(request: NextRequest) {
  try {
    return NextResponse.next({ request });
  } catch {
    return NextResponse.next();
  }
}

const SESSIONLESS_ERROR_NAMES = new Set([
  "AuthSessionMissingError",
  "AuthInvalidJwtError",
  "AuthInvalidCredentialsError",
  "AuthInvalidTokenResponseError",
  "AuthRefreshDiscardedError",
]);

function isMissingSession(error: { name?: string; status?: number } | null) {
  if (!error) return true;
  if (error.name && SESSIONLESS_ERROR_NAMES.has(error.name)) return true;
  return typeof error.status === "number" && error.status >= 400 && error.status < 500;
}

/**
 * Refresca la sesión de Supabase en Edge Runtime.
 *
 * Cualquier fallo de configuración, red o cookies se captura acá. El
 * middleware decide si la request puede continuar o si debe derivar a login.
 */
export async function updateSession(
  request: NextRequest,
): Promise<SessionUpdate> {
  if (!isSupabaseConfigured()) {
    return {
      supabase: null,
      response: nextResponse(request),
      user: null,
      failed: false,
    };
  }

  let response = nextResponse(request);

  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        fetch: fetchWithTimeout,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headersToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });

            response = nextResponse(request);

            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });

            Object.entries(headersToSet ?? {}).forEach(([name, value]) => {
              response.headers.set(name, value);
            });
          } catch (error) {
            logMiddlewareError("No se pudieron actualizar las cookies", error);
          }
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();

    if (error && !isMissingSession(error)) {
      logMiddlewareError("No se pudo verificar la sesión", error);
      return {
        supabase: null,
        response,
        user: null,
        failed: true,
      };
    }

    return {
      supabase,
      response,
      user: data.user ?? null,
      failed: false,
    };
  } catch (error) {
    logMiddlewareError("Supabase no está disponible", error);
    return {
      supabase: null,
      response: nextResponse(request),
      user: null,
      failed: true,
    };
  }
}
