'use client';

import { useQuery } from '@tanstack/react-query';
import { makeAdvertisersModule } from '../../index';
import type { ListAdvertisersQuery } from '../../infrastructure/repositories/http-advertiser-repository';

export const useAdvertisersQuery = (params: ListAdvertisersQuery = {}) => {
  const { repository } = makeAdvertisersModule();
  return useQuery({
    queryKey: ['advertisers', params],
    queryFn: () => repository.list({ ...params, perPage: 20 }),
  });
};
