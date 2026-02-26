import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { HttpLocationRepository } from './infrastructure/repositories/http-location-repository';

export const makeLocationsModule = () => {
  const httpClient = new FetchHttpClient();
  return { repository: new HttpLocationRepository(httpClient) };
};
