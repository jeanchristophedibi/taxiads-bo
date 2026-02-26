'use client';

import { useQuery } from '@tanstack/react-query';
import { makeScreensModule } from '../../index';
import type { ListScreensQuery } from '../../application/dto/list-screens-query';

export const useScreensListQuery = (params?: ListScreensQuery) => {
  const { listScreens } = makeScreensModule();

  return useQuery({
    queryKey: ['screens', params],
    queryFn: () => listScreens.execute(params ?? {}),
  });
};
