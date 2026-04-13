import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { HttpArtworkRepository } from './infrastructure/repositories/http-artwork-repository';

export const makeArtworksModule = () => {
  const httpClient = new FetchHttpClient();
  return { repository: new HttpArtworkRepository(httpClient) };
};
