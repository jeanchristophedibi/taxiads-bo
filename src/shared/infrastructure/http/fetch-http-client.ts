import { env } from '@/shared/config/env';
import { AppError } from '@/shared/domain/app-error';
import type { HttpClient, HttpRequest } from './http-client';

const toQueryString = (query: HttpRequest['query']): string => {
  if (!query) return '';
  const params = new URLSearchParams();

  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined) params.set(k, String(v));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export class FetchHttpClient implements HttpClient {
  async request<T>(request: HttpRequest): Promise<T> {
    const url = `${env.apiBaseUrl}${request.path}${toQueryString(request.query)}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(request.headers ?? {}),
    };

    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (env.sharedSecret) {
      headers['X-Shared-Secret'] = env.sharedSecret;
    }

    const response = await fetch(url, {
      method: request.method ?? 'GET',
      headers,
      body: request.body ? JSON.stringify(request.body) : undefined,
      cache: 'no-store',
    });

    if (response.status === 401) {
      throw new AppError('UNAUTHORIZED', 'Session expirée', { status: 401 });
    }

    if (!response.ok) {
      throw new AppError('NETWORK', `HTTP ${response.status}`, {
        status: response.status,
        path: request.path,
      });
    }

    return (await response.json()) as T;
  }
}
