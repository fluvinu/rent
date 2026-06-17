const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_URL}${url}`, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // window.location.href = '/'; // optional redirect
    }
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Login failed');
  const token = await res.text();
  setToken(token);
  return token;
}

export async function register(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.text();
}

export async function fetchEntityTypes() {
  return fetchWithAuth(`/api/entity-types`, { cache: 'no-store' });
}

export async function createEntityType(entityType: any) {
  return fetchWithAuth(`/api/entity-types`, {
    method: 'POST',
    body: JSON.stringify(entityType),
  });
}

export async function fetchRecordsByEntityType(entityTypeId: string) {
  return fetchWithAuth(`/api/records/entity/${entityTypeId}`, { cache: 'no-store' });
}

export async function createEntityRecord(entityTypeId: string, data: any) {
  return fetchWithAuth(`/api/records/entity/${entityTypeId}`, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}
