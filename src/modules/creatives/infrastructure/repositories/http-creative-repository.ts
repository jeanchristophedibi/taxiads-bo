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
}
