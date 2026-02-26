'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeLocationsModule } from '../../index';
import type { SaveLocationInput } from '../../infrastructure/repositories/http-location-repository';

export const useCreateLocationMutation = () => {
  const { repository } = makeLocationsModule();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveLocationInput) => repository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['options', 'locations'] });
    },
  });
};

export const useUpdateLocationMutation = () => {
  const { repository } = makeLocationsModule();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SaveLocationInput }) => repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['options', 'locations'] });
    },
  });
};
