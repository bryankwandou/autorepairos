import { AUTH_TOKEN_KEY } from "@/constants/auth";
import { requestJson } from "@/services/http";

type AuthResponse = {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
  };
};

type LoginPayload = {
  email: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const result = await requestJson<AuthResponse>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  localStorage.setItem(AUTH_TOKEN_KEY, result.token);
  return result;
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function logout() {
  await requestJson<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
  clearAuthToken();
}
