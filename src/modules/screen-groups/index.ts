import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';
import { HttpScreenGroupRepository } from './infrastructure/repositories/http-screen-group-repository';

export function makeScreenGroupsModule() {
  const httpClient = new FetchHttpClient();
  const repository = new HttpScreenGroupRepository(httpClient);
  return { repository };
}
