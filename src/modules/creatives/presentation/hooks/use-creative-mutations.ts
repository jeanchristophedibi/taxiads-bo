'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeCreativesModule } from '../../index';
import type { CreateCreativeInput, UpdateCreativeInput } from '../../infrastructure/repositories/http-creative-repository';

export const useCreateCreativeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCreativeInput) => {
      const { repository } = makeCreativesModule();
      return repository.create(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['creatives'] }),
  });
};

export const useUpdateCreativeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCreativeInput }) => {
      const { repository } = makeCreativesModule();
      return repository.update(id, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['creatives'] }),
  });
};

export const useToggleCreativeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { repository } = makeCreativesModule();
      return repository.toggleActive(id, isActive);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['creatives'] }),
  });
};

export const useDeleteCreativeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const { repository } = makeCreativesModule();
      return repository.delete(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['creatives'] }),
  });
};
