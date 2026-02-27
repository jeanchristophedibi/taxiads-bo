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

const pad2 = (n: number) => String(n).padStart(2, '0');

const isoUtc = (d: Date) =>
  `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:00+00:00`;

export const useToggleAnnouncementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, activate }: { id: string; activate: boolean }) => {
      const { repository } = makeAnnouncementsModule();
      const now = new Date();
      const future = new Date(now);
      future.setUTCFullYear(future.getUTCFullYear() + 1);
      const data: UpdateAnnouncementInput = activate
        ? { starts_at: isoUtc(now), ends_at: isoUtc(future) }
        : { ends_at: isoUtc(now) };
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
