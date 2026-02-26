'use client';

import { useQuery } from '@tanstack/react-query';
import { makeLocationsModule } from '../../index';
import type { ListLocationsQuery } from '../../infrastructure/repositories/http-location-repository';

export const useLocationsQuery = (params: ListLocationsQuery = {}) => {
  const { repository } = makeLocationsModule();
  return useQuery({
    queryKey: ['locations', params],
    queryFn: () => repository.list({ ...params, perPage: 20 }),
  });
};
