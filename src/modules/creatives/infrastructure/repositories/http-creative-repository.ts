import { AppError } from '@/shared/domain/app-error';
import type { PaginatedResult } from '@/shared/domain/paginated';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { Creative } from '../../domain/entities/creative';
import type { CreativeDto } from '../schemas/creative-dto';
import { toCreativeEntity } from '../schemas/creative-dto';

export interface ListCreativesQuery {
  search?: string;
  campaignId?: string;
  isActive?: boolean;
  page?: number;
  perPage?: number;
}

export interface CreateCreativeInput {
  name: string;
  media: File;
  campaign_id?: string;
  duration?: number;
  orientation?: string;
  is_active?: boolean;
}

export interface UpdateCreativeInput {
  name?: string;
  media?: File;
  duration?: number | null;
  orientation?: string | null;
  is_active?: boolean;
  campaign_id?: string | null;
}

interface PaginatedCreativesDto {
  data: CreativeDto[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}

export class HttpCreativeRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(query: ListCreativesQuery = {}) {
    try {
      const response = await this.httpClient.request<PaginatedCreativesDto>({
        path: '/bo/creatives',
        query: {
          search: query.search,
          campaign_id: query.campaignId,
          is_active: query.isActive,
          page: query.page,
          per_page: query.perPage,
        },
      });

      const value: PaginatedResult<Creative> = {
        data: response.data.map(toCreativeEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      };

      return ok(value);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch creatives', error));
    }
  }

  async create(data: CreateCreativeInput) {
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('media', data.media);
      if (data.campaign_id) fd.append('campaign_id', data.campaign_id);
      if (data.duration != null) fd.append('duration', String(data.duration));
      if (data.orientation) fd.append('orientation', data.orientation);
      fd.append('is_active', data.is_active === false ? '0' : '1');

      const response = await this.httpClient.request<{ data: CreativeDto }>({
        path: '/bo/creatives',
        method: 'POST',
        formData: fd,
      });
      return ok(toCreativeEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to create creative', error));
    }
  }

  async update(id: string, data: UpdateCreativeInput) {
    try {
      if (data.media) {
        const fd = new FormData();
        fd.append('_method', 'PUT');
        fd.append('media', data.media);
        if (data.name != null) fd.append('name', data.name);
        if (data.campaign_id !== undefined) fd.append('campaign_id', data.campaign_id ?? '');
        if (data.duration !== undefined) fd.append('duration', data.duration != null ? String(data.duration) : '');
        if (data.orientation !== undefined) fd.append('orientation', data.orientation ?? '');
        if (data.is_active !== undefined) fd.append('is_active', data.is_active ? '1' : '0');

        const response = await this.httpClient.request<{ data: CreativeDto }>({
          path: `/bo/creatives/${id}`,
          method: 'POST',
          formData: fd,
        });
        return ok(toCreativeEntity(response.data));
      }

      const { media: _media, ...rest } = data;
      const response = await this.httpClient.request<{ data: CreativeDto }>({
        path: `/bo/creatives/${id}`,
        method: 'PUT',
        body: rest,
      });
      return ok(toCreativeEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to update creative', error));
    }
  }

  async toggleActive(id: string, isActive: boolean) {
    try {
      const response = await this.httpClient.request<{ data: CreativeDto }>({
        path: `/bo/creatives/${id}`,
        method: 'PATCH',
        body: { is_active: isActive },
      });
      return ok(toCreativeEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to toggle creative', error));
    }
  }

  async delete(id: string) {
    try {
      await this.httpClient.request({ path: `/bo/creatives/${id}`, method: 'DELETE' });
      return ok(undefined);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to delete creative', error));
    }
  }
}
