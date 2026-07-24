import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { hashPassword } from "@/lib/auth";
import { createAuthToken } from "@/lib/jwt";
import { ensureSchema, sql } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { message: "Email dan kata sandi perlu diisi." },
      { status: 400 },
    );
  }

  const email = String(body.email).trim().toLowerCase();
  const password = String(body.password);

  if (!email.includes("@")) {
    return NextResponse.json({ message: "Format email belum benar." }, { status: 400 });
  }

  if (password.trim().length < 6) {
    return NextResponse.json({ message: "Kata sandi perlu berisi minimal 6 karakter." }, { status: 400 });
  }

  await ensureSchema();

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ message: "Email ini sudah dipakai." }, { status: 409 });
  }

  const user = {
    id: crypto.randomUUID(),
    email,
    passwordHash: await hashPassword(password),
  };

  await sql`
    INSERT INTO users (id, email, password_hash)
    VALUES (${user.id}, ${user.email}, ${user.passwordHash})
  `;

  const token = await createAuthToken({
    userId: user.id,
    email: user.email,
  });

  const response = NextResponse.json({
    message: "Akun berhasil dibuat",
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 2,
    path: "/",
  });

  return response;
}
