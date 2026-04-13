import { AppError } from '@/shared/domain/app-error';
import type { PaginatedResult } from '@/shared/domain/paginated';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { Artwork } from '../../domain/entities/artwork';
import type { ArtworkDto } from '../schemas/artwork-dto';
import { toArtworkEntity } from '../schemas/artwork-dto';

export interface ListArtworksQuery {
  search?: string;
  page?: number;
  perPage?: number;
}

export interface SaveArtworkInput {
  name: string;
  artist?: string;
  horizontal?: File;
  vertical?: File;
  banner?: File;
}

interface PaginatedArtworksDto {
  data: ArtworkDto[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}

const buildFormData = (data: SaveArtworkInput, withMethod?: 'PUT') => {
  const fd = new FormData();
  if (withMethod) fd.append('_method', withMethod);
  fd.append('name', data.name);
  if (data.artist) fd.append('artist', data.artist);
  if (data.horizontal) fd.append('file_horizontal', data.horizontal);
  if (data.vertical) fd.append('file_vertical', data.vertical);
  if (data.banner) fd.append('file_banner', data.banner);
  return fd;
};

export class HttpArtworkRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(query: ListArtworksQuery = {}) {
    try {
      const response = await this.httpClient.request<PaginatedArtworksDto>({
        path: '/bo/artworks',
        query: {
          search: query.search,
          page: query.page,
          per_page: query.perPage,
        },
      });

      const value: PaginatedResult<Artwork> = {
        data: response.data.map(toArtworkEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      };

      return ok(value);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch artworks', error));
    }
  }

  async create(data: SaveArtworkInput) {
    try {
      const response = await this.httpClient.request<{ data: ArtworkDto }>({
        path: '/bo/artworks',
        method: 'POST',
        formData: buildFormData(data),
      });
      return ok(toArtworkEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to create artwork', error));
    }
  }

  async update(id: string, data: SaveArtworkInput) {
    try {
      const response = await this.httpClient.request<{ data: ArtworkDto }>({
        path: `/bo/artworks/${id}`,
        method: 'POST',
        formData: buildFormData(data, 'PUT'),
      });
      return ok(toArtworkEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to update artwork', error));
    }
  }

  async delete(id: string) {
    try {
      await this.httpClient.request({ path: `/bo/artworks/${id}`, method: 'DELETE' });
      return ok(undefined);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to delete artwork', error));
    }
  }
}
