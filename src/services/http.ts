export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message ?? "Terjadi kesalahan pada server.";
    throw new HttpError(message, response.status);
  }

  return data as T;
}
