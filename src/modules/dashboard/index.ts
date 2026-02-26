import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { GetKpis } from './application/use-cases/get-kpis';
import { HttpDashboardRepository } from './infrastructure/repositories/http-dashboard-repository';

export const makeDashboardModule = () => {
  const httpClient = new FetchHttpClient();
  const repository = new HttpDashboardRepository(httpClient);
  return { getKpis: new GetKpis(repository) };
};
