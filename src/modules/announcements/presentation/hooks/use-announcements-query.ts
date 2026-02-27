'use client';

import { useQuery } from '@tanstack/react-query';
import { makeAnnouncementsModule } from '../../index';
import type { ListAnnouncementsQuery } from '../../infrastructure/repositories/http-announcement-repository';

export const useAnnouncementsQuery = (params: ListAnnouncementsQuery = {}) => {
  return useQuery({
    queryKey: ['announcements', params],
    queryFn: async () => {
      const { repository } = makeAnnouncementsModule();
      const result = await repository.list(params);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
};
