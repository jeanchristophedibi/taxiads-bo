'use client';

import Link from 'next/link';
import { usePlaylistsQuery } from '../hooks/use-playlists-query';
import { PlaylistActionsMenu } from './playlist-actions-menu';

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100/80">
      {[200, 140, 60, 60, 60, 28].map((w, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="skeleton h-3.5" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

/* ─── Count pill ─────────────────────────────────────────────────────────── */
function CountPill({ value, color }: { value: number; color: 'slate' | 'violet' | 'sky' }) {
  const cls = {
    slate: 'bg-slate-100 text-slate-600',
    violet: 'bg-violet-50 text-violet-700',
    sky: 'bg-sky-50 text-sky-700',
  }[color];
  return (
    <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md text-xs font-semibold tabular-nums ${cls}`}>
      {value}
    </span>
  );
}

/* ─── Table ──────────────────────────────────────────────────────────────── */
interface Props {
  search?: string;
  page?: number;
  onPageChange?: (page: number) => void;
}

export function PlaylistsTable({ search, page = 1, onPageChange }: Props) {
  const { data, isLoading, isError } = usePlaylistsQuery({ search, page });

  if (isLoading) {
    return (
      <div className="overflow-x-auto"><table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th>Playlist</th><th>Campagne</th><th>Écrans</th><th>Items</th><th>Lieux</th><th className="w-10" />
          </tr>
        </thead>
        <tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
      </table></div>
    );
  }

  if (isError || !data?.ok) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500 font-medium">Impossible de charger les playlists.</p>
        <p className="text-xs text-slate-400 mt-1">Vérifiez votre connexion et réessayez.</p>
      </div>
    );
  }

  const rows = data.value.data;
  const meta = data.value.meta;

  if (!rows.length) {
    return (
      <div className="py-16 text-center">
        <div className="w-12 h-12 rounded-apple bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M3 12h12M3 18h12M16 16l5-4-5-4v8z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Aucune playlist trouvée</p>
        <p className="text-xs text-slate-400 mt-1">Créez votre première playlist pour commencer.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto"><table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th>Playlist</th>
            <th>Campagne</th>
            <th>Écrans</th>
            <th>Items</th>
            <th>Lieux</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="tbl-body">
          {rows.map((row) => (
            <tr key={row.id}>
              {/* Playlist name */}
              <td>
                <Link
                  href={`/playlists/${row.id}`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'var(--apple-blue)' }}
                >
                  {row.name}
                </Link>
                {row.internalName && (
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{row.internalName}</p>
                )}
              </td>

              {/* Campaign */}
              <td>
                {row.campaign
                  ? <span className="badge bg-sky-50 text-sky-700">{row.campaign.value}</span>
                  : <span className="text-slate-300">—</span>}
              </td>

              {/* Screens count */}
              <td><CountPill value={row.screensCount} color="slate" /></td>

              {/* Items count */}
              <td><CountPill value={row.playlistItemsCount} color="violet" /></td>

              {/* Locations count */}
              <td><CountPill value={row.locationsCount} color="sky" /></td>

              {/* Actions */}
              <td className="px-3">
                <PlaylistActionsMenu playlist={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--apple-separator)', background: 'rgba(249,249,251,0.7)' }}>
        <p className="text-xs" style={{ color: 'var(--apple-label)' }}>
          {meta.total} playlist{meta.total > 1 ? 's' : ''} • page {meta.currentPage}/{meta.lastPage}
        </p>
        {meta.lastPage > 1 && (
          <div className="flex items-center gap-1">
            <button type="button" disabled={meta.currentPage <= 1} onClick={() => onPageChange?.(meta.currentPage - 1)} className="btn-secondary text-xs px-3 py-1">← Préc.</button>
            <button type="button" disabled={meta.currentPage >= meta.lastPage} onClick={() => onPageChange?.(meta.currentPage + 1)} className="btn-secondary text-xs px-3 py-1">Suiv. →</button>
          </div>
        )}
      </div>
    </>
  );
}
