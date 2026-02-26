'use client';

import { useQuery } from '@tanstack/react-query';
import { makeCreativesModule } from '../../index';
import type { ListCreativesQuery } from '../../infrastructure/repositories/http-creative-repository';

export const useCreativesQuery = (params: ListCreativesQuery = {}) => {
  const { repository } = makeCreativesModule();
  return useQuery({
    queryKey: ['creatives', params],
    queryFn: () => repository.list({ ...params, perPage: 20 }),
  });
};
