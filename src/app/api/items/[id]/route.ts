import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { ensureSchema, sql } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const authPayload = await authenticateRequest(request);
  if (!authPayload) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await ensureSchema();
  const rows = await sql`
    SELECT id, title, description, owner_id AS "ownerId", created_at AS "createdAt", updated_at AS "updatedAt"
    FROM items WHERE id = ${id} AND owner_id = ${authPayload.userId}
  `;

  if (!rows[0]) {
    return NextResponse.json({ message: "Catatan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ item: rows[0] });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const authPayload = await authenticateRequest(request);
  if (!authPayload) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (!body?.title) {
    return NextResponse.json({ message: "Judul catatan perlu diisi." }, { status: 400 });
  }

  await ensureSchema();
  const title = String(body.title);
  const description = String(body.description ?? "");

  const rows = await sql`
    UPDATE items SET title = ${title}, description = ${description}, updated_at = now()
    WHERE id = ${id} AND owner_id = ${authPayload.userId}
    RETURNING id, title, description, owner_id AS "ownerId", created_at AS "createdAt", updated_at AS "updatedAt"
  `;

  if (!rows[0]) {
    return NextResponse.json({ message: "Catatan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ message: "Catatan berhasil diperbarui", item: rows[0] });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const authPayload = await authenticateRequest(request);
  if (!authPayload) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await ensureSchema();

  const rows = await sql`
    DELETE FROM items WHERE id = ${id} AND owner_id = ${authPayload.userId}
    RETURNING id, title, description, owner_id AS "ownerId", created_at AS "createdAt", updated_at AS "updatedAt"
  `;

  if (!rows[0]) {
    return NextResponse.json({ message: "Catatan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ message: "Catatan berhasil dihapus", item: rows[0] });
}
