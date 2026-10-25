#!/usr/bin/env node
/**
 * Verifica la conexión con Supabase y el estado mínimo del esquema.
 *
 * Uso:
 *   npm run verify:supabase
 *
 * No imprime claves ni datos personales. Usa la service role únicamente para
 * comprobar tablas, Storage y el administrador inicial.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!url || !anonKey || !serviceRoleKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY o SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

let hasErrors = false;

function ok(label, detail = "") {
  console.log(`✓ ${label}${detail ? ` · ${detail}` : ""}`);
}

function fail(label, detail = "") {
  hasErrors = true;
  console.log(`✗ ${label}${detail ? ` · ${detail}` : ""}`);
}

function cleanupMessage(message) {
  return String(message ?? "")
    .replace(/\s+/g, " ")
    .slice(0, 180);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

try {
  const parsedUrl = new URL(url);
  ok("URL de Supabase", parsedUrl.host);
  if (parsedUrl.protocol !== "https:") {
    fail("La URL de Supabase debe usar HTTPS");
  }
} catch {
  fail("NEXT_PUBLIC_SUPABASE_URL no es una URL válida");
}

const tables = ["profiles", "products", "orders", "order_items"];
for (const table of tables) {
  const { count, error } = await admin
    .from(table)
    .select("id", { count: "exact" })
    .limit(1);

  if (error) {
    fail(`Tabla ${table}`, `${error.code ?? ""} ${cleanupMessage(error.message)}`);
  } else {
    ok(`Tabla ${table}`, `${count ?? 0} filas`);
  }
}

const anonProducts = await anon
  .from("products")
  .select("id", { count: "exact" })
  .limit(1);

if (anonProducts.error) {
  fail(
    "Acceso anónimo a products",
    `${anonProducts.error.code ?? ""} ${cleanupMessage(anonProducts.error.message)}`,
  );
} else {
  ok("Acceso anónimo a products", "la API responde");
}

const functions = [
  [
    "create_order",
    {
      p_items: [],
      p_payment_method: "cash",
      p_fulfillment_method: "pickup",
      p_contact_phone: "000000",
    },
  ],
  ["cancel_order", { p_order_id: "00000000-0000-0000-0000-000000000000" }],
  [
    "admin_update_order_status",
    {
      p_order_id: "00000000-0000-0000-0000-000000000000",
      p_status: "pending",
      p_payment_status: "pending",
    },
  ],
];

for (const [name, args] of functions) {
  const { error } = await admin.rpc(name, args);
  if (error?.code === "PGRST202") {
    fail(`RPC ${name}`, "no existe");
  } else if (error) {
    // La función existe y respondió con una validación esperada.
    ok(`RPC ${name}`, "existe");
  } else {
    ok(`RPC ${name}`, "existe");
  }
}

const bucket = await admin.storage.getBucket("product-images");
if (bucket.error) {
  fail("Bucket product-images", cleanupMessage(bucket.error.message));
} else {
  ok("Bucket product-images", `público=${bucket.data.public}`);
}

const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (users.error) {
  fail("Auth Admin", cleanupMessage(users.error.message));
} else {
  ok("Auth Admin", `${users.data.users.length} usuarios`);

  if (adminEmail) {
    const user = users.data.users.find(
      (item) => item.email?.toLowerCase() === adminEmail,
    );

    if (!user) {
      fail("Administrador inicial", "el email de ADMIN_EMAIL no existe en Auth");
    } else {
      const profile = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile.error) {
        fail("Perfil del administrador", cleanupMessage(profile.error.message));
      } else if (!profile.data) {
        fail("Perfil del administrador", "el usuario existe pero no tiene perfil");
      } else if (profile.data.role !== "admin") {
        fail("Perfil del administrador", `rol actual: ${profile.data.role}`);
      } else {
        ok("Administrador inicial", "perfil con rol admin");
      }
    }
  }
}

console.log("");
if (hasErrors) {
  console.log(
    "Resultado: hay puntos pendientes. Revisá las migraciones y el bootstrap del administrador.",
  );
  process.exitCode = 1;
} else {
  console.log("Resultado: conexión y esquema mínimo verificados.");
}
