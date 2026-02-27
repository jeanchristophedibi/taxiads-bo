'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeAnnouncementsModule } from '../../index';
import type { SaveAnnouncementInput, UpdateAnnouncementInput } from '../../infrastructure/repositories/http-announcement-repository';

export const useCreateAnnouncementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SaveAnnouncementInput) => {
      const { repository } = makeAnnouncementsModule();
      const result = await repository.create(data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
};

export const useUpdateAnnouncementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAnnouncementInput }) => {
      const { repository } = makeAnnouncementsModule();
      const result = await repository.update(id, data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
};

export const useDeleteAnnouncementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { repository } = makeAnnouncementsModule();
      const result = await repository.delete(id);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
};
