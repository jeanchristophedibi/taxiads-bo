'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeCampaignsModule } from '../../index';
import type { CreateCampaignInput, UpdateCampaignInput } from '../../domain/repositories/campaign-repository';

export const useCreateCampaignMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCampaignInput) => {
      const { repository } = makeCampaignsModule();
      const result = await repository.create(data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });
};

export const useUpdateCampaignMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCampaignInput }) => {
      const { repository } = makeCampaignsModule();
      const result = await repository.update(id, data);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });
};
