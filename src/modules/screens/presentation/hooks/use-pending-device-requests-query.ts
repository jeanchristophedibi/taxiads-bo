'use client';

import { useQuery } from '@tanstack/react-query';
import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { AppError } from '@/shared/domain/app-error';
import { err, ok } from '@/shared/domain/result';

export interface PendingDeviceRequestItem {
  id: string;
  hostname: string | null;
  androidId: string | null;
  fingerprint: string | null;
  clientType: string | null;
  status: string | null;
  accessRequestStatus: string | null;
  accessRequestedAt: string | null;
  accessRequestNotes: string | null;
  validationCode: string | null;
  validationCodeExpiresAt: string | null;
  screen: { id: string; name: string; screenCode: string } | null;
}

export interface PendingDeviceRequestsResult {
  data: PendingDeviceRequestItem[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}

interface PendingDeviceRequestsDto {
  data: Array<{
    id: string;
    hostname: string | null;
    android_id: string | null;
    fingerprint: string | null;
    client_type: string | null;
    status: string | null;
    access_request_status: string | null;
    access_requested_at: string | null;
    access_request_notes: string | null;
    validation_code: string | null;
    validation_code_expires_at: string | null;
    screen: { id: string; name: string; screen_code: string } | null;
  }>;
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

const fetchPendingDeviceRequests = async (params?: { search?: string; page?: number; perPage?: number }) => {
  try {
    const httpClient = new FetchHttpClient();
    const response = await httpClient.request<PendingDeviceRequestsDto>({
      path: '/bo/devices/requests',
      query: {
        search: params?.search,
        page: params?.page,
        per_page: params?.perPage,
      },
    });

    return ok<PendingDeviceRequestsResult>({
      data: response.data.map((item) => ({
        id: item.id,
        hostname: item.hostname,
        androidId: item.android_id,
        fingerprint: item.fingerprint,
        clientType: item.client_type,
        status: item.status,
        accessRequestStatus: item.access_request_status,
        accessRequestedAt: item.access_requested_at,
        accessRequestNotes: item.access_request_notes,
        validationCode: item.validation_code,
        validationCodeExpiresAt: item.validation_code_expires_at,
        screen: item.screen
          ? {
              id: item.screen.id,
              name: item.screen.name,
              screenCode: item.screen.screen_code,
            }
          : null,
      })),
      meta: {
        currentPage: response.meta.current_page,
        perPage: response.meta.per_page,
        total: response.meta.total,
        lastPage: response.meta.last_page,
      },
    });
  } catch (error) {
    return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch pending device requests', error));
  }
};

export const usePendingDeviceRequestsQuery = (params?: { search?: string; page?: number; perPage?: number }) =>
  useQuery({
    queryKey: ['device-requests', params],
    queryFn: () => fetchPendingDeviceRequests(params),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
