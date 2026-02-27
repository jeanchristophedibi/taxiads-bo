'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeArtworksModule } from '../../index';
import type { SaveArtworkInput } from '../../infrastructure/repositories/http-artwork-repository';

export const useCreateArtworkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SaveArtworkInput) => {
      const { repository } = makeArtworksModule();
      const result = await repository.create(data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artworks'] }),
  });
};

export const useUpdateArtworkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SaveArtworkInput }) => {
      const { repository } = makeArtworksModule();
      const result = await repository.update(id, data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artworks'] }),
  });
};

export const useDeleteArtworkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { repository } = makeArtworksModule();
      const result = await repository.delete(id);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artworks'] }),
  });
};
