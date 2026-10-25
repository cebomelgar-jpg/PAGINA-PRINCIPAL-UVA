export const APP_NAME = "Un Viaje Astral";
export const PORTAL_NAME = "Portal de pacientes";

export const CONTACT = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5493434151054",
  email: "unviajeastralclub@gmail.com",
  instagram: "https://www.instagram.com/unviajeastral.ok/",
  address: "Victoria 235, Paraná, Entre Ríos",
};

export const MAIN_SITE_URL =
  process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://unviajeastral.com";

export const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";

export const BANK_DETAILS = {
  alias: process.env.NEXT_PUBLIC_BANK_ALIAS || "",
  cbu: process.env.NEXT_PUBLIC_BANK_CBU || "",
  holder: process.env.NEXT_PUBLIC_BANK_HOLDER || "",
};

export function whatsappUrl(message?: string) {
  const text = message || "Hola, quisiera consultar por el portal de pacientes de Un Viaje Astral.";
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Copiá .env.example a .env.local y completá las credenciales de Supabase.",
    );
  }

  return { url, anonKey };
}
