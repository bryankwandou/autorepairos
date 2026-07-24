import { Pool } from "pg";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    const raw = process.env.DATABASE_URL;
    if (!raw) {
      throw new Error("DATABASE_URL is not set");
    }
    // Enable SSL for managed Postgres (e.g. Neon); plain local containers don't need it.
    const useSsl = /neon\.tech|sslmode=require/.test(raw);
    // channel_binding can trip up node-postgres, so drop it and manage SSL explicitly.
    const connectionString = raw.replace(/([?&])channel_binding=[^&]*/g, (_match, sep) =>
      sep === "?" ? "?" : "",
    );
    pool = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

// Tagged-template helper that mirrors the neon() call signature: sql`... ${value}`
export async function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const text = strings.reduce(
    (acc, part, index) => acc + part + (index < values.length ? `$${index + 1}` : ""),
    "",
  );
  const result = await getPool().query(text, values);
  return result.rows as T[];
}

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}
