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

const mapStatusToErrorCode = (status: number): 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'NETWORK' => {
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 422) return 'VALIDATION';
  return 'NETWORK';
};

export class FetchHttpClient implements HttpClient {
  async request<T>(request: HttpRequest): Promise<T> {
    const url = `${env.apiBaseUrl}${request.path}${toQueryString(request.query)}`;

    const isFormData = !!request.formData;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      // Omit Content-Type for FormData — browser sets it with the correct boundary
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
      body: isFormData ? request.formData : request.body ? JSON.stringify(request.body) : undefined,
      cache: 'no-store',
    });

    if (response.status === 401) {
      throw new AppError('UNAUTHORIZED', 'Session expirée', { status: 401 });
    }

    if (!response.ok) {
      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      const backendMessage =
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof (payload as { message?: unknown }).message === 'string'
          ? (payload as { message: string }).message
          : undefined;

      throw new AppError(
        mapStatusToErrorCode(response.status),
        backendMessage ?? `HTTP ${response.status}`,
        {
          status: response.status,
          path: request.path,
          ...(typeof payload === 'object' && payload !== null ? payload : {}),
        },
      );
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}
