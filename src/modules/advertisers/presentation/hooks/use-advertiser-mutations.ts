'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeAdvertisersModule } from '../../index';
import type { SaveAdvertiserInput } from '../../infrastructure/repositories/http-advertiser-repository';

export const useCreateAdvertiserMutation = () => {
  const { repository } = makeAdvertisersModule();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveAdvertiserInput) => repository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisers'] });
      queryClient.invalidateQueries({ queryKey: ['options', 'advertisers'] });
    },
  });
};

export const useUpdateAdvertiserMutation = () => {
  const { repository } = makeAdvertisersModule();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SaveAdvertiserInput }) => repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisers'] });
      queryClient.invalidateQueries({ queryKey: ['options', 'advertisers'] });
    },
  });
};
