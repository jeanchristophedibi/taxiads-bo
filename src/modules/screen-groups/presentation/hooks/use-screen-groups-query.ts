'use client';

import { useQuery } from '@tanstack/react-query';
import { makeScreenGroupsModule } from '../../index';

export const useScreenGroupsQuery = (params: { search?: string; page?: number; perPage?: number } = {}) =>
  useQuery({
    queryKey: ['screen-groups', params],
    queryFn: async () => {
      const { repository } = makeScreenGroupsModule();
      const result = await repository.list(params);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
