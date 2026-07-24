import { compare, hash } from "bcryptjs";
import { NextRequest } from "next/server";
import { verifyAuthToken, type AuthTokenPayload } from "@/lib/jwt";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthTokenPayload | null> {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}
