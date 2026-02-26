'use client';

import Link from 'next/link';
import { usePlaylistsQuery } from '../hooks/use-playlists-query';
import type { Playlist } from '../../domain/entities/playlist';

interface Props {
  search?: string;
  page?: number;
  onPageChange?: (page: number) => void;
  onEdit?: (playlist: Playlist) => void;
  onItems?: (playlist: Playlist) => void;
}

export function PlaylistsTable({ search, page = 1, onPageChange, onEdit, onItems }: Props) {
  const { data, isLoading, isError } = usePlaylistsQuery({ search, page });

  if (isLoading) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Chargement…</div>;
  }

  if (isError || !data || !data.ok) {
    return <div className="px-5 py-12 text-center text-sm text-red-500">Impossible de charger les playlists.</div>;
  }

  const rows = data.value.data;
  const meta = data.value.meta;

  if (!rows.length) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Aucune playlist trouvée.</div>;
  }

  const canPrev = meta.currentPage > 1;
  const canNext = meta.currentPage < meta.lastPage;

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Playlist</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Campagne</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Écrans</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Items</th>
            {(onEdit || onItems) && <th className="px-5 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3">
                <Link href={`/playlists/${row.id}`} className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline">
                  {row.name}
                </Link>
                {row.internalName && <div className="text-xs text-slate-400">{row.internalName}</div>}
              </td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.campaign?.value ?? '—'}</td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.screensCount}</td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.playlistItemsCount}</td>
              {(onEdit || onItems) && (
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-3">
                    {onItems && (
                      <button
                        onClick={() => onItems(row)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        Items
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        Modifier
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between gap-3">
        <span>
          {meta.total} playlist{meta.total > 1 ? 's' : ''} · page {meta.currentPage}/{meta.lastPage}
        </span>
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => canPrev && onPageChange?.(meta.currentPage - 1)}
            disabled={!canPrev}
            className="px-2.5 py-1 border border-slate-200 rounded-md text-xs text-slate-600 disabled:opacity-40"
          >
            Précédent
          </button>
          <button
            onClick={() => canNext && onPageChange?.(meta.currentPage + 1)}
            disabled={!canNext}
            className="px-2.5 py-1 border border-slate-200 rounded-md text-xs text-slate-600 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      </div>
    </>
  );
}
