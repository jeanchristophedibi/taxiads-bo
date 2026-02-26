import { AppError } from '@/shared/domain/app-error';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { PlayLogDto } from '../schemas/play-log-dto';
import { toPlayLogEntity } from '../schemas/play-log-dto';

export interface ListPlayLogsQuery {
  screenId?: string;
  campaignId?: string;
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
}

interface PaginatedPlayLogsDto {
  data: PlayLogDto[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}

export class HttpPlayLogRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(query: ListPlayLogsQuery = {}) {
    try {
      const response = await this.httpClient.request<PaginatedPlayLogsDto>({
        path: '/bo/play-logs',
        query: {
          screen_id: query.screenId,
          campaign_id: query.campaignId,
          from: query.from,
          to: query.to,
          page: query.page,
          per_page: query.perPage ?? 30,
        },
      });
      return ok({
        data: response.data.map(toPlayLogEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      });
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch play logs', error));
    }
  }
}
