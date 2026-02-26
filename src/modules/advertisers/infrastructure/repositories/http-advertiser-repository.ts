import { AppError } from '@/shared/domain/app-error';
import type { PaginatedResult } from '@/shared/domain/paginated';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { Advertiser } from '../../domain/entities/advertiser';
import type { AdvertiserDto } from '../schemas/advertiser-dto';
import { toAdvertiserEntity } from '../schemas/advertiser-dto';

export interface ListAdvertisersQuery {
  search?: string;
  page?: number;
  perPage?: number;
}

export interface SaveAdvertiserInput {
  name: string;
  contact_email?: string;
  contact_phone?: string;
}

interface PaginatedAdvertisersDto {
  data: AdvertiserDto[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}

export class HttpAdvertiserRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(query: ListAdvertisersQuery = {}) {
    try {
      const response = await this.httpClient.request<PaginatedAdvertisersDto>({
        path: '/bo/advertisers',
        query: {
          search: query.search,
          page: query.page,
          per_page: query.perPage,
        },
      });

      const value: PaginatedResult<Advertiser> = {
        data: response.data.map(toAdvertiserEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      };

      return ok(value);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch advertisers', error));
    }
  }

  async create(data: SaveAdvertiserInput) {
    try {
      const response = await this.httpClient.request<{ data: AdvertiserDto }>({
        path: '/bo/advertisers',
        method: 'POST',
        body: data,
      });
      return ok(toAdvertiserEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to create advertiser', error));
    }
  }

  async update(id: string, data: SaveAdvertiserInput) {
    try {
      const response = await this.httpClient.request<{ data: AdvertiserDto }>({
        path: `/bo/advertisers/${id}`,
        method: 'PUT',
        body: data,
      });
      return ok(toAdvertiserEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to update advertiser', error));
    }
  }
}
