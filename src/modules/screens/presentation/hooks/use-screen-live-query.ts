'use client';

import { useQuery } from '@tanstack/react-query';
import { makeScreensModule } from '../../index';

const useRepo = () => makeScreensModule().screenRepository;

export const useScreenNowPlayingQuery = (screenId: string, enabled: boolean) => useQuery({
  queryKey: ['screens', 'now-playing', screenId],
  queryFn: () => useRepo().getNowPlaying(screenId),
  enabled,
  refetchInterval: 15000,
  refetchOnWindowFocus: true,
});

export const useScreenTimelineQuery = (screenId: string, enabled: boolean) => useQuery({
  queryKey: ['screens', 'timeline', screenId],
  queryFn: () => useRepo().getTimeline(screenId, { windowHours: 24, limit: 30, historyLimit: 20 }),
  enabled,
  refetchInterval: 30000,
  refetchOnWindowFocus: true,
});

export const useScreenHealthQuery = (screenId: string, enabled: boolean) => useQuery({
  queryKey: ['screens', 'health', screenId],
  queryFn: () => useRepo().getHealth(screenId, { staleAfterSeconds: 180 }),
  enabled,
  refetchInterval: 15000,
  refetchOnWindowFocus: true,
});
