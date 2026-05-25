/**
 * 1) catalog_items.sql anwenden (wenn SUPABASE_DB_PASSWORD in .env.local)
 * 2) Menü aus dem Code in catalog_items einspielen (service_role)
 *
 * Ausführen: npm run db:catalog
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { getStaticCatalog } from "../src/lib/catalog-static";

function loadEnvLocal(): void {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i > 0) process.env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
}

async function applyCatalogSql(): Promise<boolean> {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!password || !url) return false;

  const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!ref) throw new Error("NEXT_PUBLIC_SUPABASE_URL ungültig");

  const ddl = readFileSync(resolve(process.cwd(), "supabase/catalog_items.sql"), "utf8");
  const sql = postgres({
    host: "aws-0-eu-west-1.pooler.supabase.com",
    port: 6543,
    database: "postgres",
    username: `postgres.${ref}`,
    password,
    ssl: "require",
    max: 1,
  });

  try {
    await sql.unsafe(ddl);
    console.log("✓ catalog_items.sql ausgeführt");
    return true;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function seedCatalog(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in .env.local setzen");
  }

  const sb = createClient(url, key);
  const now = new Date().toISOString();
  const rows = getStaticCatalog().map((r) => ({ ...r, updated_at: now }));

  const { error } = await sb.from("catalog_items").upsert(rows, { onConflict: "id" });
  if (error) {
    if (error.code === "PGRST205") {
      throw new Error(
        "Tabelle catalog_items fehlt. Bitte supabase/catalog_items.sql im Supabase SQL Editor ausführen " +
          "(oder SUPABASE_DB_PASSWORD in .env.local setzen und npm run db:catalog erneut starten).",
      );
    }
    throw new Error(error.message);
  }

  console.log(`✓ ${rows.length} Katalog-Artikel eingespielt`);
}

async function main(): Promise<void> {
  loadEnvLocal();

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local");
  }
  console.log("✓ SUPABASE_SERVICE_ROLE_KEY ist gesetzt");

  const applied = await applyCatalogSql();
  if (!applied) {
    console.log(
      "→ SUPABASE_DB_PASSWORD nicht gesetzt: SQL manuell im Supabase SQL Editor ausführen (catalog_items.sql)",
    );
  }

  await seedCatalog();
}

main().catch((e: unknown) => {
  console.error("Fehler:", e instanceof Error ? e.message : e);
  process.exit(1);
});
