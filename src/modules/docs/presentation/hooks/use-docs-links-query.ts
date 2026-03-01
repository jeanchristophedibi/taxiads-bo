'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDocsLinks } from '../../infrastructure/fetch-docs-links';

export const useDocsLinksQuery = () =>
  useQuery({
    queryKey: ['docs-links'],
    queryFn: fetchDocsLinks,
    staleTime: 5 * 60_000,
  });
