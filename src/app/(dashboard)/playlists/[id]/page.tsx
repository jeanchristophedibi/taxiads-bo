'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { usePlaylistDetailQuery } from '@/modules/playlists/presentation/hooks/use-playlist-detail-query';
import { usePlaylistItemsQuery } from '@/modules/playlists/presentation/hooks/use-playlist-items';
import { PlaylistItemsModal } from '@/modules/playlists/presentation/components/playlist-items-modal';
import { useAuthPermissions } from '@/shared/application/use-auth-permissions';

export default function PlaylistDetailPage() {
  const { can } = useAuthPermissions();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: detailResult, isLoading: loadingDetail, isError: detailError } = usePlaylistDetailQuery(id);
  const { data: itemsData, isLoading: loadingItems, isError: itemsError } = usePlaylistItemsQuery(id);

  const detail = detailResult && detailResult.ok ? detailResult.value : null;
  const items = itemsData?.items ?? [];
  const [search, setSearch] = useState('');
  const [itemsModalOpen, setItemsModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => {
      const values = [
        item.title ?? '',
        item.creative?.value ?? '',
        item.page?.value ?? '',
        item.layout?.value ?? '',
      ].map((v) => v.toLowerCase());
      return values.some((v) => v.includes(query));
    });
  }, [items, search]);

  if (!can('playlists.read')) {
    return <div className="text-sm text-slate-500">Acces non autorise.</div>;
  }

  if (loadingDetail) {
    return <div className="text-sm text-slate-400">Chargement du détail playlist…</div>;
  }

  if (detailError || !detail) {
    return <div className="text-sm text-red-500">Impossible de charger le détail de la playlist.</div>;
  }

  return (
    <>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{detail.name}</h1>
          <p className="text-xs text-slate-500 mt-1">Détail playlist</p>
        </div>
        <div className="flex items-center gap-2">
          {can('playlists.write') && (
            <button
              type="button"
              onClick={() => setItemsModalOpen(true)}
              className="btn-primary"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M3 12h12M3 18h12M16 16l5-4-5-4v8z" />
              </svg>
              Gérer les items
            </button>
          )}
          <Link href="/playlists" className="btn-secondary">
            Retour
          </Link>
        </div>
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
          <div className="relative mt-3 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Filtrer les items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        {loadingItems ? (
          <div className="px-5 py-10 text-sm text-slate-400">Chargement des items…</div>
        ) : itemsError ? (
          <div className="px-5 py-10 text-sm text-red-500">Impossible de charger les items.</div>
        ) : filteredItems.length === 0 ? (
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
              {filteredItems.map((item) => (
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

    {itemsModalOpen && can('playlists.write') && (
      <PlaylistItemsModal
        playlist={{ id: detail.id, name: detail.name }}
        onClose={() => setItemsModalOpen(false)}
      />
    )}
    </>
  );
}
