import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { HttpPlaylistRepository } from './infrastructure/repositories/http-playlist-repository';

export const makePlaylistsModule = () => {
  const httpClient = new FetchHttpClient();
  return { repository: new HttpPlaylistRepository(httpClient) };
};
