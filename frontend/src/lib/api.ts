export const BASE_URL = "https://rent-0xm8.onrender.com";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jwt");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("jwt", token);
  else localStorage.removeItem("jwt");
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg =
      (body && (body.message || body.error)) ||
      (typeof body === "string" ? body : null) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body as T;
}

export type FieldType =
  | "TEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "SELECT"
  | "MULTI_SELECT"
  | "RELATION"
  | "FILE"
  | "JSON";

export interface FieldDef {
  key?: string;
  name: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  relationTargetType?: string;
}

export interface EntityType {
  id: string;
  name: string;
  description?: string;
  fields: FieldDef[];
  subEntityTypes?: string[];
}

export interface EntityRecord {
  id: string;
  entityTypeId: string;
  parentRecordId?: string;
  data: Record<string, any>;
}
