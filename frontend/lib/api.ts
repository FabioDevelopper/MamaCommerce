const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sokho_token');
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sokho_token', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sokho_token');
    localStorage.removeItem('sokho_user');
  }
}

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function api<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { params, ...customConfig } = options;

  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = getAuthToken();
  const headers = new Headers(customConfig.headers);

  if (!headers.has('Content-Type') && !(customConfig.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...customConfig,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }

  // Si c'est du CSV ou binaire
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('text/csv')) {
    const text = await response.text();
    return text as unknown as T;
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = json.error || json.message || `Erreur API (${response.status})`;
    throw new Error(message);
  }

  return (json.data !== undefined ? json.data : json) as T;
}
