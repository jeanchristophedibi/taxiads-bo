import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { HttpAnnouncementRepository } from './infrastructure/repositories/http-announcement-repository';

export const makeAnnouncementsModule = () => {
  const httpClient = new FetchHttpClient();
  return { repository: new HttpAnnouncementRepository(httpClient) };
};
