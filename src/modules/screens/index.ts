import { ListScreens } from './application/use-cases/list-screens';
import { HttpScreenRepository } from './infrastructure/repositories/http-screen-repository';
import { FetchHttpClient } from '@/shared/infrastructure/http/fetch-http-client';

export const makeScreensModule = () => {
  const httpClient = new FetchHttpClient();
  const screenRepository = new HttpScreenRepository(httpClient);

  return {
    listScreens: new ListScreens(screenRepository),
  };
};
