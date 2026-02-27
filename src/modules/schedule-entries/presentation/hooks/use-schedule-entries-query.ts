'use client';

import { useQuery } from '@tanstack/react-query';
import { makeScheduleEntriesModule } from '../../index';
import type { ListScheduleEntriesQuery } from '../../infrastructure/repositories/http-schedule-entry-repository';

export const useScheduleEntriesQuery = (params: ListScheduleEntriesQuery = {}) => {
  return useQuery({
    queryKey: ['schedule-entries', params],
    queryFn: async () => {
      const { repository } = makeScheduleEntriesModule();
      const result = await repository.list(params);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
};
