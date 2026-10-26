export const APP_NAME = "Un Viaje Astral";
export const PORTAL_NAME = "Portal de pacientes";

export const FALLBACK_SUPABASE_URL =
  "https://aupaythuamaplaleqojn.supabase.co";
export const FALLBACK_SUPABASE_ANON_KEY =
  "sb_publishable_g0DvwHHF2VgUa5npuo6ZgA_zxIx8YiL";

const FALLBACK_PORTAL_URL = "http://localhost:3000";
const FALLBACK_MAIN_SITE_URL = "https://unviajeastral.com";
const FALLBACK_WHATSAPP_NUMBER = "5493434151054";

function readValue(value: string | undefined) {
  return value?.trim() ?? "";
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

function normalizeSupabaseUrl(value: string | undefined) {
  const candidate = readValue(value);
  if (!candidate || !isHttpUrl(candidate)) return FALLBACK_SUPABASE_URL;
  return new URL(candidate).origin;
}

function normalizeWhatsAppNumber(value: string | undefined) {
  const digits = readValue(value).replace(/\D/g, "");
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
  alias: readValue(process.env.NEXT_PUBLIC_BANK_ALIAS),
  cbu: readValue(process.env.NEXT_PUBLIC_BANK_CBU),
  holder: readValue(process.env.NEXT_PUBLIC_BANK_HOLDER),
};

/**
 * Valores efectivos para crear clientes de Supabase.
 *
 * Estas constantes nunca son undefined y nunca lanzan una excepción. Si la
 * variable no está inyectada en Vercel (o contiene una URL inválida), se usa
 * el proyecto público por defecto. La publishable/anon key es pública y está
 * protegida por las políticas RLS de la base.
 */
export const SUPABASE_URL = normalizeSupabaseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const SUPABASE_ANON_KEY =
  readValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  FALLBACK_SUPABASE_ANON_KEY;

export function whatsappUrl(message?: string) {
  const text =
    message ||
    "Hola, quisiera consultar por el portal de pacientes de Un Viaje Astral.";
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}

/**
 * El fallback público garantiza que el portal siempre tenga una configuración
 * válida, incluso si Vercel no inyectó las variables NEXT_PUBLIC_*.
 */
export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}