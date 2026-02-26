'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { makePlaylistsModule } from '../../index';
import type { SavePlaylistItemInput } from '../../infrastructure/repositories/http-playlist-repository';

export const usePlaylistItemsQuery = (playlistId?: string) => {
  return useQuery({
    queryKey: ['playlist-items', playlistId],
    enabled: Boolean(playlistId),
    queryFn: async () => {
      const { repository } = makePlaylistsModule();
      const result = await repository.listItems(playlistId as string);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
};

export const useCreatePlaylistItemMutation = (playlistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SavePlaylistItemInput) => {
      const { repository } = makePlaylistsModule();
      const result = await repository.createItem(playlistId, data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-items', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};

export const useUpdatePlaylistItemMutation = (playlistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: Partial<SavePlaylistItemInput> }) => {
      const { repository } = makePlaylistsModule();
      const result = await repository.updateItem(playlistId, itemId, data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-items', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};

export const useDeletePlaylistItemMutation = (playlistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { repository } = makePlaylistsModule();
      const result = await repository.deleteItem(playlistId, itemId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-items', playlistId] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};
