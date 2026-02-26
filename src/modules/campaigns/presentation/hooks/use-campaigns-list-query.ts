'use client';

import { useQuery } from '@tanstack/react-query';
import { makeCampaignsModule } from '../../index';
import type { ListCampaignsQuery } from '../../domain/repositories/campaign-repository';

export const useCampaignsListQuery = (params: ListCampaignsQuery = {}) => {
  const { listCampaigns } = makeCampaignsModule();
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => listCampaigns.execute(params),
  });
};
