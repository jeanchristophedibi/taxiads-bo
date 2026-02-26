import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { HttpCreativeRepository } from './infrastructure/repositories/http-creative-repository';

export const makeCreativesModule = () => {
  const httpClient = new FetchHttpClient();
  return { repository: new HttpCreativeRepository(httpClient) };
};
