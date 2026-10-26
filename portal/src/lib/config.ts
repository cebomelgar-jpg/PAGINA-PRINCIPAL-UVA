export const APP_NAME = "Un Viaje Astral";
export const PORTAL_NAME = "Portal de pacientes";

const FALLBACK_PORTAL_URL = "http://localhost:3000";
const FALLBACK_MAIN_SITE_URL = "https://unviajeastral.com";
const FALLBACK_WHATSAPP_NUMBER = "5493434151054";

function readValue(value: string | undefined) {
  return value?.trim() || undefined;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

function normalizePublicUrl(value: string | undefined, fallback: string) {
  const candidate = readValue(value);
  if (!candidate || !isHttpUrl(candidate)) return fallback;
  return new URL(candidate).origin;
}

function normalizeWhatsAppNumber(value: string | undefined) {
  const digits = readValue(value)?.replace(/\D/g, "");
  return digits || FALLBACK_WHATSAPP_NUMBER;
}

export const CONTACT = {
  whatsapp: normalizeWhatsAppNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  ),
  email: "unviajeastralclub@gmail.com",
  instagram: "https://www.instagram.com/unviajeastral.ok/",
  address: "Victoria 235, Paraná, Entre Ríos",
};

export const MAIN_SITE_URL = normalizePublicUrl(
  process.env.NEXT_PUBLIC_MAIN_SITE_URL,
  FALLBACK_MAIN_SITE_URL,
);

export const PORTAL_URL = normalizePublicUrl(
  process.env.NEXT_PUBLIC_PORTAL_URL,
  FALLBACK_PORTAL_URL,
);

export const BANK_DETAILS = {
  alias: readValue(process.env.NEXT_PUBLIC_BANK_ALIAS) ?? "",
  cbu: readValue(process.env.NEXT_PUBLIC_BANK_CBU) ?? "",
  holder: readValue(process.env.NEXT_PUBLIC_BANK_HOLDER) ?? "",
};

export function whatsappUrl(message?: string) {
  const text =
    message ||
    "Hola, quisiera consultar por el portal de pacientes de Un Viaje Astral.";
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}

/**
 * Devuelve false si falta alguna credencial o si la URL no es HTTP(S).
 * El middleware usa este chequeo para no intentar inicializar Supabase con
 * valores incompletos o inválidos en Edge Runtime.
 */
export function isSupabaseConfigured() {
  const url = readValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = readValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return Boolean(url && anonKey && isHttpUrl(url));
}

export function getSupabaseEnv() {
  const url = readValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = readValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Copiá .env.example a .env.local y completá las credenciales de Supabase.",
    );
  }

  if (!isHttpUrl(url)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL no es una URL HTTP(S) válida. Revisá la configuración de Supabase.",
    );
  }

  return { url, anonKey };
}
