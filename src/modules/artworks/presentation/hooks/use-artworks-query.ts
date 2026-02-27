'use client';

import { useQuery } from '@tanstack/react-query';
import { makeArtworksModule } from '../../index';
import type { ListArtworksQuery } from '../../infrastructure/repositories/http-artwork-repository';

export const useArtworksQuery = (params: ListArtworksQuery = {}) => {
  return useQuery({
    queryKey: ['artworks', params],
    queryFn: async () => {
      const { repository } = makeArtworksModule();
      const result = await repository.list({ ...params, perPage: params.perPage ?? 20 });
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
};
