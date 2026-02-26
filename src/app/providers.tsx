'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { AppError } from '@/shared/domain/app-error';
import { makeQueryClient } from '@/shared/application/query-client';
import { ToastProvider } from '@/shared/ui/toast-provider';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        event.query.state.status === 'error' &&
        event.query.state.error instanceof AppError &&
        event.query.state.error.code === 'UNAUTHORIZED'
      ) {
        document.cookie = 'auth_token=; Max-Age=0; path=/';
        document.cookie = 'auth_user=; Max-Age=0; path=/';
        router.replace('/login');
      }
    });
    return unsubscribe;
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
