'use client';

import dynamic from 'next/dynamic';
import type { ScreenMapItem } from '../../domain/entities/screen';

const DynamicScreensMapInner = dynamic(
  () => import('./screens-map-inner').then((mod) => mod.ScreensMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[65vh] min-h-[420px] w-full rounded-xl border border-slate-200 bg-white flex items-center justify-center text-sm text-slate-400">
        Chargement de la carte…
      </div>
    ),
  },
);

export function ScreensMap({ items }: { items: ScreenMapItem[] }) {
  return <DynamicScreensMapInner items={items} />;
}
