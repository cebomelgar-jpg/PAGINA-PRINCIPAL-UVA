#!/usr/bin/env node
/**
 * Crea (o promueve) el administrador inicial del portal.
 *
 * Uso:
 *   1. Copiar .env.example a .env.local y completar las credenciales.
 *   2. npm run bootstrap:admin
 *
 * Requiere SUPABASE_SERVICE_ROLE_KEY. Nunca ejecutar en el navegador ni
 * exponer esa clave con el prefijo NEXT_PUBLIC_.
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadLocalEnv() {
  for (const filename of [".env.local", ".env"]) {
    const file = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(file)) continue;

    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

async function findUserByEmail(supabase, email) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;

    const found = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    if (found) return found;
    if (data.users.length < 1000) return null;
  }
  return null;
}

async function main() {
  loadLocalEnv();

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "https://aupaythuamaplaleqojn.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME || "Administración UVA";

  if (!serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local. Es obligatoria para crear o promover al administrador.",
    );
  }
  if (!email || !password) {
    throw new Error("Faltan ADMIN_EMAIL o ADMIN_PASSWORD en .env.local.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let user = await findUserByEmail(supabase, email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw error;
    user = data.user;
    console.log(`✓ Usuario administrador creado: ${email}`);
  } else {
    console.log(`• El usuario ${email} ya existía; se actualizará su rol.`);
  }

  if (!user) throw new Error("No pudimos obtener el usuario administrador.");

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      role: "admin",
    },
    { onConflict: "id" },
  );

  if (profileError) throw profileError;

  console.log("✓ Perfil promovido a administrador.");
  console.log("");
  console.log("Ya podés ingresar al portal con:");
  console.log(`  Email: ${email}`);
  console.log("  Contraseña: la definida en ADMIN_PASSWORD");
  console.log("");
  console.log("Recordá borrar ADMIN_PASSWORD de .env.local si no lo necesitás.");
}

main().catch((error) => {
  console.error("");
  console.error("✗ No pudimos crear el administrador.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
