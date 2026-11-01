// Thin wrapper around fetch for calling the BalSaathi backend API.
// Base URL comes from NEXT_PUBLIC_API_BASE_URL (e.g. http://localhost:5000/api).

// Responses use the backend's { success, message, data } envelope; apiFetch returns `data`.

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

export const AUTH_TOKEN_KEY = "balsaathi_token";

type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  query?: Record<string, QueryValue>;
  body?: unknown;
  // Defaults to the token saved in localStorage under AUTH_TOKEN_KEY.
  token?: string;
}

function getStoredToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  const url = `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function apiFetch<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { query, body, token = getStoredToken(), headers, ...init } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  let finalBody: BodyInit | undefined;
  if (body instanceof FormData) {
    finalBody = body;
  } else if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(buildUrl(path, query), { ...init, headers: finalHeaders, body: finalBody });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : null) ?? `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, data);
  }

  if (data && typeof data === "object" && "data" in data) {
    return data.data as T;
  }
  return data as T;
}

export const api = {
  get: <T = unknown>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T = unknown>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  put: <T = unknown>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  patch: <T = unknown>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T = unknown>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
