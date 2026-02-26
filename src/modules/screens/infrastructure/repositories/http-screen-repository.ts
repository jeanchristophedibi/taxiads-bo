import { AppError } from '@/shared/domain/app-error';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { ScreenRepository } from '../../domain/repositories/screen-repository';
import type { PaginatedScreensDto, ScreenDto } from '../schemas/screen-dto';
import { toScreenEntity } from '../schemas/screen-dto';

export class HttpScreenRepository implements ScreenRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(params?: { search?: string; status?: string; page?: number; perPage?: number }) {
    try {
      const response = await this.httpClient.request<PaginatedScreensDto>({
        path: '/bo/screens',
        query: {
          search: params?.search,
          status: params?.status,
          page: params?.page,
          per_page: params?.perPage,
        },
      });
      return ok({
        data: response.data.map(toScreenEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      });
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch screens', error));
    }
  }

  async getById(id: string) {
    try {
      const response = await this.httpClient.request<{ data: ScreenDto }>({ path: `/bo/screens/${id}` });
      return ok(toScreenEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch screen', error));
    }
  }

  async restart(id: string) {
    try {
      await this.httpClient.request({ path: `/bo/screens/${id}/restart`, method: 'POST' });
      return ok(undefined);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to restart screen', error));
    }
  }
}
