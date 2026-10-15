// Browser-only API client for the Laravel backend (runs on the user's machine, e.g. localhost:8000).
const BASE_KEY = "api_base_url";
const TOKEN_KEY = "api_token";
export const DEFAULT_BASE = "http://localhost:8000";

export function getBaseUrl(): string {
  if (typeof window === "undefined") return DEFAULT_BASE;
  return localStorage.getItem(BASE_KEY) || DEFAULT_BASE;
}
export function setBaseUrl(url: string) {
  localStorage.setItem(BASE_KEY, url.replace(/\/+$/, ""));
}
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function extractToken(res: any): string | null {
  return (
    res?.access_token ??
    res?.token ??
    res?.authorization?.token ??
    res?.data?.access_token ??
    res?.data?.token ??
    null
  );
}

async function raw(method: string, path: string, body?: unknown, auth = true) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}/${path.replace(/^\/+/, "")}`, {
      method,
      headers,
      body: body === undefined ? null : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      `Não foi possível conectar à API em ${getBaseUrl()}. Verifique se ela está rodando.`,
      0,
    );
  }
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { res, json };
}

let refreshing: Promise<boolean> | null = null;
async function tryRefresh(): Promise<boolean> {
  if (!getToken()) return false;
  refreshing ??= raw("POST", "api/auth/refresh")
    .then(({ res, json }) => {
      const t = res.ok ? extractToken(json) : null;
      if (t) setToken(t);
      return !!t;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function api<T = any>(
  method: string,
  path: string,
  body?: unknown,
  opts: { auth?: boolean } = {},
): Promise<T> {
  const auth = opts.auth ?? true;
  let { res, json } = await raw(method, path, body, auth);
  if (res.status === 401 && auth && !path.includes("refresh") && (await tryRefresh())) {
    ({ res, json } = await raw(method, path, body, auth));
  }
  if (!res.ok) {
    const msg =
      (json && typeof json === "object" && (json.message || json.error)) ||
      `Erro ${res.status}`;
    throw new ApiError(String(msg), res.status, json?.errors);
  }
  return json as T;
}

/** Laravel responses wrap data under different keys; find the array of rows. */
export function unwrapList(json: any): { rows: any[]; lastPage: number } {
  if (Array.isArray(json)) return { rows: json, lastPage: 1 };
  if (json && typeof json === "object") {
    if (Array.isArray(json.data)) return { rows: json.data, lastPage: json.last_page ?? 1 };
    for (const v of Object.values(json)) {
      if (Array.isArray(v)) return { rows: v, lastPage: 1 };
      if (v && typeof v === "object" && Array.isArray((v as any).data))
        return { rows: (v as any).data, lastPage: (v as any).last_page ?? 1 };
    }
  }
  return { rows: [], lastPage: 1 };
}

/** Unwrap a single-record response. */
export function unwrapOne(json: any): any {
  if (!json || typeof json !== "object") return json;
  if ("id" in json) return json;
  for (const v of Object.values(json)) {
    if (v && typeof v === "object" && !Array.isArray(v) && "id" in (v as any)) return v;
  }
  return json;
}

export async function listAll(path: string, opts: { auth?: boolean } = {}): Promise<any[]> {
  const sep = path.includes("?") ? "&" : "?";
  const first = unwrapList(await api("GET", `${path}${sep}page=1`, undefined, opts));
  const rows = [...first.rows];
  for (let p = 2; p <= Math.min(first.lastPage, 200); p++) {
    rows.push(...unwrapList(await api("GET", `${path}${sep}page=${p}`, undefined, opts)).rows);
  }
  return rows;
}
