import { AppError } from '@/shared/domain/app-error';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { CampaignRepository, ListCampaignsQuery, CreateCampaignInput, UpdateCampaignInput } from '../../domain/repositories/campaign-repository';
import type { CampaignStatus } from '../../domain/entities/campaign';
import type { CampaignDto } from '../schemas/campaign-dto';
import { toCampaignEntity } from '../schemas/campaign-dto';

interface PaginatedCampaignsDto {
  data: CampaignDto[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}

interface RelationDto {
  key: string;
  value: string;
}

export interface CampaignLocationItem {
  key: string;
  value: string;
  city?: string | null;
  priority: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

interface CampaignLocationsDto {
  data: {
    campaign: { key: string; value: string; status?: string };
    locations: CampaignLocationItem[];
  };
}

export interface CampaignLocationInput {
  location_id: string;
  priority?: number;
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
}

interface SyncCampaignLocationsDto {
  data: {
    campaign: RelationDto;
    locations_count: number;
    locations: CampaignLocationItem[];
  };
}

export class HttpCampaignRepository implements CampaignRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(query: ListCampaignsQuery) {
    try {
      const response = await this.httpClient.request<PaginatedCampaignsDto>({
        path: '/bo/campaigns',
        query: {
          search: query.search,
          status: query.status,
          page: query.page,
          per_page: query.perPage,
        },
      });
      return ok({
        data: response.data.map(toCampaignEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      });
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch campaigns', error));
    }
  }

  async create(data: CreateCampaignInput) {
    try {
      const response = await this.httpClient.request<{ data: CampaignDto }>({
        path: '/bo/campaigns',
        method: 'POST',
        body: data,
      });
      return ok(toCampaignEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to create campaign', error));
    }
  }

  async update(id: string, data: UpdateCampaignInput) {
    try {
      const response = await this.httpClient.request<{ data: CampaignDto }>({
        path: `/bo/campaigns/${id}`,
        method: 'PUT',
        body: data,
      });
      return ok(toCampaignEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to update campaign', error));
    }
  }

  async patchStatus(id: string, status: CampaignStatus) {
    try {
      await this.httpClient.request({ path: `/bo/campaigns/${id}/status`, method: 'PATCH', body: { status } });
      return ok(undefined);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to update status', error));
    }
  }

  async getLocations(campaignId: string) {
    try {
      const response = await this.httpClient.request<CampaignLocationsDto>({
        path: `/bo/campaigns/${campaignId}/locations`,
      });
      return ok(response.data);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch campaign locations', error));
    }
  }

  async syncLocations(campaignId: string, locations: CampaignLocationInput[]) {
    try {
      const response = await this.httpClient.request<SyncCampaignLocationsDto>({
        path: `/bo/campaigns/${campaignId}/locations`,
        method: 'PUT',
        body: { locations },
      });
      return ok(response.data);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to sync campaign locations', error));
    }
  }
}
