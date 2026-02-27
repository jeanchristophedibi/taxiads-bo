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

const fetchOptions = async (resource: string): Promise<OptionItem[]> => {
  const token = getAuthToken();
  const res = await fetch(`${env.apiBaseUrl}/bo/options/${resource}`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { data: OptionItem[] };
  return json.data ?? [];
};

export const useOptionsQuery = (resource: 'advertisers' | 'projects' | 'campaigns' | 'locations' | 'screens' | 'playlists' | 'creatives' | 'layouts' | 'pages' | 'artworks' | 'screen-groups' | 'rooms' | 'schedule-types' | 'schedule-organizers') =>
  useQuery({
    queryKey: ['options', resource],
    queryFn: () => fetchOptions(resource),
    staleTime: 5 * 60_000,
  });
