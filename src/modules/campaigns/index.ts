import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { ListCampaigns } from './application/use-cases/list-campaigns';
import { HttpCampaignRepository } from './infrastructure/repositories/http-campaign-repository';

export const makeCampaignsModule = () => {
  const httpClient = new FetchHttpClient();
  const repository = new HttpCampaignRepository(httpClient);
  return { listCampaigns: new ListCampaigns(repository), repository };
};
