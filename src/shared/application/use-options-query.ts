'use client';

import { useQuery } from '@tanstack/react-query';
import { env } from '@/shared/config/env';

export interface OptionItem {
  key: string;
  value: string;
}

const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const normalizeOptionItems = (payload: unknown): OptionItem[] => {
  if (!Array.isArray(payload)) return [];

  return payload
    .map((item): OptionItem | null => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;

      const rawKey = record.key ?? record.id ?? record.code ?? record.slug ?? record.screen_code;
      const rawValue = record.value ?? record.label ?? record.name ?? record.title ?? record.screen_code ?? record.code ?? record.id;

      if (rawKey === null || rawKey === undefined || rawValue === null || rawValue === undefined) return null;

      const key = String(rawKey).trim();
      const value = String(rawValue).trim();
      if (!key || !value) return null;

      return { key, value };
    })
    .filter((item): item is OptionItem => item !== null);
};

const fetchOptions = async (resource: string): Promise<OptionItem[]> => {
  const token = getAuthToken();
  const res = await fetch(`${env.apiBaseUrl}/bo/options/${resource}`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(env.sharedSecret ? { 'X-Shared-Secret': env.sharedSecret } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`OPTIONS_${resource.toUpperCase()}_HTTP_${res.status}`);
  }

  const json = (await res.json()) as { data?: unknown; items?: unknown };
  const fromData = normalizeOptionItems(json.data);
  if (fromData.length > 0) return fromData;

  if (json.data && typeof json.data === 'object') {
    const nested = normalizeOptionItems((json.data as Record<string, unknown>).data);
    if (nested.length > 0) return nested;
  }

  const fromItems = normalizeOptionItems(json.items);
  if (fromItems.length > 0) return fromItems;

  return [];
};

export const useOptionsQuery = (resource: 'advertisers' | 'projects' | 'campaigns' | 'locations' | 'screens' | 'playlists' | 'creatives' | 'layouts' | 'pages' | 'artworks' | 'screen-groups' | 'rooms' | 'schedule-types' | 'schedule-organizers') =>
  useQuery({
    queryKey: ['options', resource],
    queryFn: () => fetchOptions(resource),
    staleTime: 5 * 60_000,
  });
