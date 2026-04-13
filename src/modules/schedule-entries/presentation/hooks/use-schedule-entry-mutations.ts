'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeScheduleEntriesModule } from '../../index';
import type { SaveScheduleEntryInput, UpdateScheduleEntryInput } from '../../infrastructure/repositories/http-schedule-entry-repository';

export const useCreateScheduleEntryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SaveScheduleEntryInput) => {
      const { repository } = makeScheduleEntriesModule();
      const result = await repository.create(data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedule-entries'] }),
  });
};

export const useUpdateScheduleEntryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateScheduleEntryInput }) => {
      const { repository } = makeScheduleEntriesModule();
      const result = await repository.update(id, data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedule-entries'] }),
  });
};

export const useDeleteScheduleEntryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { repository } = makeScheduleEntriesModule();
      const result = await repository.delete(id);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedule-entries'] }),
  });
};
