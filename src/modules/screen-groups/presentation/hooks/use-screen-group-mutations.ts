'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeScreenGroupsModule } from '../../index';
import type { SaveScreenGroupInput, UpdateScreenGroupInput } from '../../infrastructure/repositories/http-screen-group-repository';

export const useCreateScreenGroupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SaveScreenGroupInput) => {
      const { repository } = makeScreenGroupsModule();
      const result = await repository.create(data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['screen-groups'] }),
  });
};

export const useUpdateScreenGroupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateScreenGroupInput }) => {
      const { repository } = makeScreenGroupsModule();
      const result = await repository.update(id, data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['screen-groups'] }),
  });
};

export const useDeleteScreenGroupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { repository } = makeScreenGroupsModule();
      const result = await repository.delete(id);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['screen-groups'] }),
  });
};
