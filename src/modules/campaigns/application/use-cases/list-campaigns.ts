import type { CampaignRepository, ListCampaignsQuery } from '../../domain/repositories/campaign-repository';

export class ListCampaigns {
  constructor(private readonly repository: CampaignRepository) {}
  execute(query: ListCampaignsQuery) {
    return this.repository.list(query);
  }
}
