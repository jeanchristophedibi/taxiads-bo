import { AppError } from '@/shared/domain/app-error';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { KpisDto } from '../schemas/kpis-dto';
import { toKpisEntity } from '../schemas/kpis-dto';

export class HttpDashboardRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getKpis() {
    try {
      const response = await this.httpClient.request<KpisDto>({ path: '/bo/dashboard/kpis' });
      return ok(toKpisEntity(response));
    } catch (error) {
      return err(
        error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch KPIs', error),
      );
    }
  }
}
