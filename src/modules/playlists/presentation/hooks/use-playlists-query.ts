'use client';

import { useQuery } from '@tanstack/react-query';
import { makePlaylistsModule } from '../../index';

export const usePlaylistsQuery = (params: { search?: string; page?: number } = {}) => {
  const { repository } = makePlaylistsModule();
  return useQuery({
    queryKey: ['playlists', params],
    queryFn: () => repository.list({ ...params, perPage: 20 }),
  });
};
