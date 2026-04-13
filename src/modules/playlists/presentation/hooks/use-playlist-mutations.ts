'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makePlaylistsModule } from '../../index';
import type { AssignPlaylistInput, CreatePlaylistInput, UpdatePlaylistInput } from '../../infrastructure/repositories/http-playlist-repository';

export const useCreatePlaylistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePlaylistInput) => {
      const { repository } = makePlaylistsModule();
      const result = await repository.create(data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['playlists'] }),
  });
};

export const useUpdatePlaylistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePlaylistInput }) => {
      const { repository } = makePlaylistsModule();
      const result = await repository.update(id, data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['playlists'] }),
  });
};

export const useAssignPlaylistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AssignPlaylistInput }) => {
      const { repository } = makePlaylistsModule();
      const result = await repository.assign(id, data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['playlists'] }),
  });
};
