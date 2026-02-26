import { AppError } from '@/shared/domain/app-error';
import type { PaginatedResult } from '@/shared/domain/paginated';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { Location } from '../../domain/entities/location';
import type { LocationDto } from '../schemas/location-dto';
import { toLocationEntity } from '../schemas/location-dto';

export interface ListLocationsQuery {
  search?: string;
  isActive?: boolean;
  page?: number;
  perPage?: number;
}

export interface SaveLocationInput {
  name: string;
  city?: string;
  country?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  radius_m?: number;
  is_active?: boolean;
}

interface PaginatedLocationsDto {
  data: LocationDto[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}

export class HttpLocationRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(query: ListLocationsQuery = {}) {
    try {
      const response = await this.httpClient.request<PaginatedLocationsDto>({
        path: '/bo/locations',
        query: {
          search: query.search,
          is_active: query.isActive,
          page: query.page,
          per_page: query.perPage,
        },
      });

      const value: PaginatedResult<Location> = {
        data: response.data.map(toLocationEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      };

      return ok(value);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch locations', error));
    }
  }

  async create(data: SaveLocationInput) {
    try {
      const response = await this.httpClient.request<{ data: LocationDto }>({
        path: '/bo/locations',
        method: 'POST',
        body: data,
      });
      return ok(toLocationEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to create location', error));
    }
  }

  async update(id: string, data: SaveLocationInput) {
    try {
      const response = await this.httpClient.request<{ data: LocationDto }>({
        path: `/bo/locations/${id}`,
        method: 'PUT',
        body: data,
      });
      return ok(toLocationEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to update location', error));
    }
  }
}
