'use client';

import { useQuery } from '@tanstack/react-query';
import { makeScreenGroupsModule } from '../../index';

export const useScreenGroupQuery = (id: string) =>
  useQuery({
    queryKey: ['screen-groups', id],
    queryFn: async () => {
      const { repository } = makeScreenGroupsModule();
      const result = await repository.getById(id);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: !!id,
  });
