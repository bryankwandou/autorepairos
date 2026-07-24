import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-super-secret-change-this";
const JWT_EXPIRES_IN = "2h";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export type AuthTokenPayload = JWTPayload & {
  userId: string;
  email: string;
};

export async function createAuthToken(payload: {
  userId: string;
  email: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}
