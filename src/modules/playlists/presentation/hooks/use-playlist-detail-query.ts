'use client';

import { useQuery } from '@tanstack/react-query';
import { makePlaylistsModule } from '../../index';

export const usePlaylistDetailQuery = (id?: string) => {
  const { repository } = makePlaylistsModule();
  return useQuery({
    queryKey: ['playlist-detail', id],
    enabled: Boolean(id),
    queryFn: () => repository.get(id as string),
  });
};
