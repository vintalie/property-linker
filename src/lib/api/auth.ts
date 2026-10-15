import { api, extractToken, setToken, unwrapOne } from "./client";

export interface Me {
  id: number;
  name?: string;
  email?: string;
  tipo_nome?: string;
  [k: string]: any;
}

export function isAdmin(me: Me | null | undefined): boolean {
  return String(me?.tipo_nome ?? "").trim().toLowerCase() === "admin";
}

export async function login(email: string, password: string) {
  const res = await api("POST", "api/login", { email, password }, { auth: false });
  const t = extractToken(res);
  if (!t) throw new Error("A API não retornou um token de acesso.");
  setToken(t);
  return res;
}

export async function register(name: string, email: string, password: string) {
  const res = await api("POST", "api/register", { name, email, password }, { auth: false });
  const t = extractToken(res);
  if (t) setToken(t);
  return res;
}

export async function fetchMe(): Promise<Me> {
  const res = await api("POST", "api/auth/me");
  return (res?.user ?? unwrapOne(res)) as Me;
}

export async function logout() {
  try {
    await api("POST", "api/auth/logout");
  } catch {
    /* ignore */
  }
  setToken(null);
}
