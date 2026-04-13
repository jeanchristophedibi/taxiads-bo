import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { HttpScheduleEntryRepository } from './infrastructure/repositories/http-schedule-entry-repository';

export const makeScheduleEntriesModule = () => {
  const httpClient = new FetchHttpClient();
  return { repository: new HttpScheduleEntryRepository(httpClient) };
};
