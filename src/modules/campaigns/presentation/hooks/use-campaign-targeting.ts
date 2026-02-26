'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { makeCampaignsModule } from '../../index';
import type { CampaignLocationInput } from '../../infrastructure/repositories/http-campaign-repository';

export const useCampaignLocationsQuery = (campaignId?: string) => {
  return useQuery({
    queryKey: ['campaign-locations', campaignId],
    enabled: Boolean(campaignId),
    queryFn: async () => {
      const { repository } = makeCampaignsModule();
      const result = await repository.getLocations(campaignId as string);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
};

export const useSyncCampaignLocationsMutation = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (locations: CampaignLocationInput[]) => {
      const { repository } = makeCampaignsModule();
      const result = await repository.syncLocations(campaignId, locations);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-locations', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
