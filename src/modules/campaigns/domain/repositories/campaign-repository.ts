import type { AppError } from '@/shared/domain/app-error';
import type { PaginatedResult } from '@/shared/domain/paginated';
import type { Result } from '@/shared/domain/result';
import type { Campaign, CampaignStatus } from '../entities/campaign';

export interface ListCampaignsQuery {
  search?: string;
  status?: CampaignStatus;
  page?: number;
  perPage?: number;
}

export interface CreateCampaignInput {
  name: string;
  advertiser_id?: string;
  status?: CampaignStatus;
  objective?: string;
  budget?: number;
  starts_at?: string;
  ends_at?: string;
  location_ids?: string[];
}

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export interface CampaignRepository {
  list(query: ListCampaignsQuery): Promise<Result<PaginatedResult<Campaign>, AppError>>;
  create(data: CreateCampaignInput): Promise<Result<Campaign, AppError>>;
  update(id: string, data: UpdateCampaignInput): Promise<Result<Campaign, AppError>>;
  patchStatus(id: string, status: CampaignStatus): Promise<Result<void, AppError>>;
}
