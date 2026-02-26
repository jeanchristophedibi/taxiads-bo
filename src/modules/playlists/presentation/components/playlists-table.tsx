'use client';

import Link from 'next/link';
import { usePlaylistsQuery } from '../hooks/use-playlists-query';
import type { Playlist } from '../../domain/entities/playlist';

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100/80">
      {[160, 120, 50, 50, 80].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="skeleton h-3.5" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

interface Props {
  search?: string;
  page?: number;
  onPageChange?: (page: number) => void;
  onEdit?: (playlist: Playlist) => void;
  onItems?: (playlist: Playlist) => void;
}

export function PlaylistsTable({ search, page = 1, onPageChange, onEdit, onItems }: Props) {
  const { data, isLoading, isError } = usePlaylistsQuery({ search, page });
  const hasActions = !!(onEdit || onItems);

  if (isLoading) {
    return (
      <table className="w-full">
        <thead><tr className="tbl-head">
          <th>Playlist</th><th>Campagne</th><th>Écrans</th><th>Items</th>{hasActions && <th />}
        </tr></thead>
        <tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
      </table>
    );
  }

  if (isError || !data?.ok) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500 font-medium">Impossible de charger les playlists.</p>
      </div>
    );
  }

  const rows = data.value.data;
  const meta = data.value.meta;

  if (!rows.length) {
    return (
      <div className="py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M3 12h12M3 18h12M16 16l5-4-5-4v8z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Aucune playlist trouvée</p>
        <p className="text-xs text-slate-400 mt-1">Créez votre première playlist pour commencer.</p>
      </div>
    );
  }

  const canPrev = meta.currentPage > 1;
  const canNext = meta.currentPage < meta.lastPage;

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th>Playlist</th>
            <th>Campagne</th>
            <th>Écrans</th>
            <th>Items</th>
            {hasActions && <th className="w-32" />}
          </tr>
        </thead>
        <tbody className="tbl-body">
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <Link
                  href={`/playlists/${row.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {row.name}
                </Link>
                {row.internalName && (
                  <p className="text-xs text-slate-400 mt-0.5">{row.internalName}</p>
                )}
              </td>
              <td className="text-sm text-slate-600">{row.campaign?.value ?? '—'}</td>
              <td>
                <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold tabular-nums">
                  {row.screensCount}
                </span>
              </td>
              <td>
                <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-violet-50 text-violet-700 text-xs font-semibold tabular-nums">
                  {row.playlistItemsCount}
                </span>
              </td>
              {hasActions && (
                <td className="text-right">
                  <div className="inline-flex items-center gap-1">
                    {onItems && (
                      <button
                        onClick={() => onItems(row)}
                        className="px-2.5 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
                      >
                        Items
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
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
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          {meta.total} playlist{meta.total > 1 ? 's' : ''} · page {meta.currentPage}/{meta.lastPage}
        </p>
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => canPrev && onPageChange?.(meta.currentPage - 1)}
            disabled={!canPrev}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Précédent
          </button>
          <button
            onClick={() => canNext && onPageChange?.(meta.currentPage + 1)}
            disabled={!canNext}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Suivant →
          </button>
        </div>
      </div>
    </>
  );
}
