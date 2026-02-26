'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePlaylistDetailQuery } from '@/modules/playlists/presentation/hooks/use-playlist-detail-query';
import { usePlaylistItemsQuery } from '@/modules/playlists/presentation/hooks/use-playlist-items';

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: detailResult, isLoading: loadingDetail, isError: detailError } = usePlaylistDetailQuery(id);
  const { data: itemsData, isLoading: loadingItems, isError: itemsError } = usePlaylistItemsQuery(id);

  const detail = detailResult && detailResult.ok ? detailResult.value : null;
  const items = itemsData?.items ?? [];

  if (loadingDetail) {
    return <div className="text-sm text-slate-400">Chargement du détail playlist…</div>;
  }

  if (detailError || !detail) {
    return <div className="text-sm text-red-500">Impossible de charger le détail de la playlist.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{detail.name}</h1>
          <p className="text-xs text-slate-500 mt-1">Détail playlist</p>
        </div>
        <Link href="/playlists" className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          Retour playlists
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500">Type</p>
          <p className="text-sm font-medium text-slate-900 mt-1">{detail.type || '—'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500">Campagne</p>
          <p className="text-sm font-medium text-slate-900 mt-1">{detail.campaign?.value ?? '—'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500">Écrans</p>
          <p className="text-sm font-medium text-slate-900 mt-1">{detail.screens_count}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500">Items</p>
          <p className="text-sm font-medium text-slate-900 mt-1">{detail.playlist_items_count}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Items de la playlist</h2>
        </div>

        {loadingItems ? (
          <div className="px-5 py-10 text-sm text-slate-400">Chargement des items…</div>
        ) : itemsError ? (
          <div className="px-5 py-10 text-sm text-red-500">Impossible de charger les items.</div>
        ) : items.length === 0 ? (
          <div className="px-5 py-10 text-sm text-slate-400">Aucun item dans cette playlist.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Titre</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Créative</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Page</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Layout</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durée</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3 text-sm text-slate-700">{item.title || '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{item.creative?.value || '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{item.page?.value || '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{item.layout?.value || '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{item.duration}s</td>
                  <td className="px-5 py-3 text-sm text-slate-500">{item.sort ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
