import { QueryClient } from '@tanstack/react-query';
import { AppError } from '@/shared/domain/app-error';

export const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (_, error) =>
          !(error instanceof AppError && error.code === 'UNAUTHORIZED'),
      },
    },
  });
