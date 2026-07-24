import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { ensureSchema, sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authPayload = await authenticateRequest(request);
  if (!authPayload) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await ensureSchema();
  const items = await sql`
    SELECT id, title, description, owner_id AS "ownerId", created_at AS "createdAt", updated_at AS "updatedAt"
    FROM items WHERE owner_id = ${authPayload.userId}
    ORDER BY created_at DESC
  `;
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const authPayload = await authenticateRequest(request);
  if (!authPayload) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.title) {
    return NextResponse.json({ message: "Judul catatan perlu diisi." }, { status: 400 });
  }

  await ensureSchema();
  const id = crypto.randomUUID();
  const title = String(body.title);
  const description = String(body.description ?? "");

  const rows = await sql`
    INSERT INTO items (id, title, description, owner_id)
    VALUES (${id}, ${title}, ${description}, ${authPayload.userId})
    RETURNING id, title, description, owner_id AS "ownerId", created_at AS "createdAt", updated_at AS "updatedAt"
  `;

  return NextResponse.json({ message: "Catatan berhasil dibuat", item: rows[0] }, { status: 201 });
}
