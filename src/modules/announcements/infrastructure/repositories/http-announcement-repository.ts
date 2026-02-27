import { AppError } from '@/shared/domain/app-error';
import type { PaginatedResult } from '@/shared/domain/paginated';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { Announcement } from '../../domain/entities/announcement';
import type { AnnouncementDto } from '../schemas/announcement-dto';
import { toAnnouncementEntity } from '../schemas/announcement-dto';

export interface ListAnnouncementsQuery {
  search?: string;
  activeAt?: string;
  page?: number;
  perPage?: number;
}

export interface SaveAnnouncementInput {
  title: string;
  content: string;
  starts_at: string;
  ends_at: string;
}

export type UpdateAnnouncementInput = Partial<SaveAnnouncementInput>;

interface PaginatedAnnouncementsDto {
  data: AnnouncementDto[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}

export class HttpAnnouncementRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(query: ListAnnouncementsQuery = {}) {
    try {
      const response = await this.httpClient.request<PaginatedAnnouncementsDto>({
        path: '/bo/announcements',
        query: {
          search: query.search,
          active_at: query.activeAt,
          page: query.page,
          per_page: query.perPage,
        },
      });

      const value: PaginatedResult<Announcement> = {
        data: response.data.map(toAnnouncementEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      };

      return ok(value);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch announcements', error));
    }
  }

  async create(data: SaveAnnouncementInput) {
    try {
      const response = await this.httpClient.request<{ data: AnnouncementDto }>({
        path: '/bo/announcements',
        method: 'POST',
        body: data,
      });
      return ok(toAnnouncementEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to create announcement', error));
    }
  }

  async update(id: string, data: UpdateAnnouncementInput) {
    try {
      const response = await this.httpClient.request<{ data: AnnouncementDto }>({
        path: `/bo/announcements/${id}`,
        method: 'PUT',
        body: data,
      });
      return ok(toAnnouncementEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to update announcement', error));
    }
  }

  async delete(id: string) {
    try {
      await this.httpClient.request({ path: `/bo/announcements/${id}`, method: 'DELETE' });
      return ok(undefined);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to delete announcement', error));
    }
  }
}
