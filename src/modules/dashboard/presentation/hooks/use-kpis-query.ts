'use client';

import { useQuery } from '@tanstack/react-query';
import { makeDashboardModule } from '../../index';

export const useKpisQuery = () => {
  const { getKpis } = makeDashboardModule();
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => getKpis.execute(),
  });
};
