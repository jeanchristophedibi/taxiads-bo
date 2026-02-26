import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { HttpPlayLogRepository } from './infrastructure/repositories/http-play-log-repository';

export const makePlayLogsModule = () => {
  const httpClient = new FetchHttpClient();
  return { repository: new HttpPlayLogRepository(httpClient) };
};
