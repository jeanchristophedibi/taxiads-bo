'use client';

import { useQuery } from '@tanstack/react-query';
import { makeScreensModule } from '../../index';
import type { ScreenStatus } from '../../domain/entities/screen';

export interface ScreensMapQuery {
  search?: string;
  status?: ScreenStatus;
  locationKey?: string;
  campaignKey?: string;
  playlistKey?: string;
  staleAfterSeconds?: number;
}

export const useScreensMapQuery = (params: ScreensMapQuery = {}) => {
  const { screenRepository } = makeScreensModule();
  const intervalSec = Math.min(86400, Math.max(30, params.staleAfterSeconds ?? 180));

  return useQuery({
    queryKey: ['screens', 'map', params],
    queryFn: () => screenRepository.getMap(params),
    refetchInterval: intervalSec * 1000,
    refetchOnWindowFocus: true,
  });
};
