'use client';

import { useQuery } from '@tanstack/react-query';
import { makePlayLogsModule } from '../../index';
import type { ListPlayLogsQuery } from '../../infrastructure/repositories/http-play-log-repository';

export const usePlayLogsQuery = (params: ListPlayLogsQuery = {}) => {
  const { repository } = makePlayLogsModule();
  return useQuery({
    queryKey: ['play-logs', params],
    queryFn: () => repository.list(params),
  });
};
