import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { HttpAdvertiserRepository } from './infrastructure/repositories/http-advertiser-repository';

export const makeAdvertisersModule = () => {
  const httpClient = new FetchHttpClient();
  return { repository: new HttpAdvertiserRepository(httpClient) };
};
