import type { ApiErrorBody } from "../types";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://food-order-management-3kc5.onrender.com";

export class ApiClientError extends Error {
  details?: Array<{ path: string; message: string }>;
  status: number;

  constructor(message: string, status: number, details?: Array<{ path: string; message: string }>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let body: ApiErrorBody | undefined;
    try {
      body = await res.json();
    } catch {
      // response had no JSON body; fall through to a generic message
    }
    throw new ApiClientError(
      body?.error?.message ?? `Request failed with status ${res.status}`,
      res.status,
      body?.error?.details
    );
  }

  const json = (await res.json()) as { data: T };
  return json.data;
}
