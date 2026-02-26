'use client';

import { useState } from 'react';
import type { ScreenStatus } from '../../domain/entities/screen';
import { useScreensListQuery } from '../hooks/use-screens-list-query';
import { toScreenRowVm } from '../view-models/screen-view-model';
import { ScreenActionsMenu } from './screen-actions-menu';
import { AssignPlaylistModal } from './assign-playlist-modal';
import {
  useBulkRefreshMutation,
  useBulkRestartMutation,
  useBulkAssignPlaylistMutation,
  useBulkUnassignPlaylistMutation,
  useBulkDeleteMutation,
  useBulkEmergencyMutation,
} from '../hooks/use-screen-mutations';
import { useToast } from '@/shared/ui/toast-provider';

/* ─── Status badge ───────────────────────────────────────────────────────── */
const STATUS_BADGE: Record<string, { bg: string; dot: string; label: string }> = {
  online:        { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'En ligne' },
  offline:       { bg: 'bg-red-100 text-red-600',         dot: 'bg-red-500',     label: 'Hors ligne' },
  restarting:    { bg: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500',   label: 'Redémarrage' },
  uninitialized: { bg: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400',   label: 'Non initialisé' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.uninitialized;
  return (
    <span className={`badge ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100/80">
      <td className="px-4 py-4"><div className="w-4 h-4 skeleton rounded" /></td>
      {[140, 100, 80, 110, 32].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="skeleton h-3.5" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

/* ─── Bulk action bar ────────────────────────────────────────────────────── */
function BulkBar({
  selectedKeys, onClear,
}: {
  selectedKeys: string[];
  onClear: () => void;
}) {
  const toast = useToast();
  const n = selectedKeys.length;
  const bulkRefresh    = useBulkRefreshMutation();
  const bulkRestart    = useBulkRestartMutation();
  const bulkAssign     = useBulkAssignPlaylistMutation();
  const bulkUnassign   = useBulkUnassignPlaylistMutation();
  const bulkDelete     = useBulkDeleteMutation();
  const bulkEmergency  = useBulkEmergencyMutation();
  const [assignModal, setAssignModal] = useState(false);

  const act = (label: string, mutate: () => Promise<unknown>) =>
    mutate().then((res: unknown) => {
      const r = res as { ok?: boolean; error?: { message: string } } | null;
      if (r && r.ok === false) toast.error(label, r.error?.message);
      else { toast.success(label); onClear(); }
    });

  const isPending = bulkRefresh.isPending || bulkRestart.isPending || bulkAssign.isPending ||
    bulkUnassign.isPending || bulkDelete.isPending || bulkEmergency.isPending;

  return (
    <>
      <div
        className="flex items-center gap-3 px-4 py-2.5 text-sm animate-slide-up"
        style={{ background: 'var(--apple-blue)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <span className="text-white font-medium shrink-0">{n} sélectionné{n > 1 ? 's' : ''}</span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={isPending}
            onClick={() => act('Actualisation envoyée', () => bulkRefresh.mutateAsync(selectedKeys))}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-white/15 text-white hover:bg-white/25 transition-colors disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
            Actualiser
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => act('Redémarrage envoyé', () => bulkRestart.mutateAsync(selectedKeys))}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-white/15 text-white hover:bg-white/25 transition-colors disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
            Redémarrer
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setAssignModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-white/15 text-white hover:bg-white/25 transition-colors disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h12M3 18h12M16 16l5-4-5-4v8z" /></svg>
            Playlist
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => act('Diffusion arrêtée', () => bulkUnassign.mutateAsync(selectedKeys))}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-white/15 text-white hover:bg-white/25 transition-colors disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="14" x="3" y="5" /><rect width="5" height="14" x="16" y="5" /></svg>
            Éteindre
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => act('Alerte incendie envoyée', () => bulkEmergency.mutateAsync({ keys: selectedKeys, type: 'fire' }))}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-red-500/80 text-white hover:bg-red-500 transition-colors disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            Incendie</button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => act('Fin d\'alerte', () => bulkEmergency.mutateAsync({ keys: selectedKeys, type: 'lifted' }))}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-white/15 text-white hover:bg-white/25 transition-colors disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            Fin alerte</button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!window.confirm(`Supprimer ${n} écran${n > 1 ? 's' : ''} ?`)) return;
              act('Écrans supprimés', () => bulkDelete.mutateAsync(selectedKeys));
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-red-600/80 text-white hover:bg-red-600 transition-colors disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
            Supprimer
          </button>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-white/60 hover:text-white transition-colors"
          title="Désélectionner tout"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {assignModal && (
        <AssignPlaylistModal
          title={`Playlist pour ${n} écran${n > 1 ? 's' : ''}`}
          onClose={() => setAssignModal(false)}
          isPending={bulkAssign.isPending}
          onConfirm={(playlistKey) => {
            bulkAssign.mutate({ keys: selectedKeys, playlistKey }, {
              onSuccess: (res) => {
                if (res && !res.ok) toast.error('Playlist', (res.error as { message: string })?.message);
                else { toast.success('Playlist assignée'); setAssignModal(false); onClear(); }
              },
              onError: (err) => toast.error('Playlist', (err as Error).message),
            });
          }}
        />
      )}
    </>
  );
}

/* ─── Table component ────────────────────────────────────────────────────── */
interface Props {
  search?: string;
  status?: ScreenStatus;
  page?: number;
  onPageChange?: (page: number) => void;
}

export function ScreensTable({ search, status, page = 1, onPageChange }: Props) {
  const { data, isLoading, isError } = useScreensListQuery({ search, status, page, perPage: 20 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setSelectedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const screens = data?.ok ? data.value.data : [];
  const meta    = data?.ok ? data.value.meta : null;
  const allChecked = screens.length > 0 && screens.every((s) => selectedIds.has(s.id));

  const toggleAll = () => {
    setSelectedIds(allChecked ? new Set() : new Set(screens.map((s) => s.id)));
  };

  if (isLoading) {
    return (
      <table className="w-full">
        <thead><tr className="tbl-head">
          <th className="w-10" />
          <th>Écran</th><th>Localisation</th><th>Statut</th><th>Dernier ping</th><th className="w-10" />
        </tr></thead>
        <tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
      </table>
    );
  }

  if (isError || !data?.ok) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500 font-medium">Impossible de charger les écrans.</p>
        <p className="text-xs text-slate-400 mt-1">Vérifiez votre connexion et réessayez.</p>
      </div>
    );
  }

  if (!screens.length) {
    return (
      <div className="py-16 text-center">
        <div className="w-12 h-12 rounded-apple bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Aucun écran trouvé</p>
        <p className="text-xs text-slate-400 mt-1">Ajustez vos filtres pour voir des résultats.</p>
      </div>
    );
  }

  const selectedKeys = screens.filter((s) => selectedIds.has(s.id)).map((s) => s.id);

  return (
    <>
      {selectedKeys.length > 0 && (
        <BulkBar selectedKeys={selectedKeys} onClear={() => setSelectedIds(new Set())} />
      )}

      <table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th className="w-10 px-4">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="rounded cursor-pointer"
                title="Tout sélectionner"
              />
            </th>
            <th>Écran</th>
            <th>Playlist</th>
            <th>Localisation</th>
            <th>Statut</th>
            <th>Dernier ping</th>
            <th className="w-12" />
          </tr>
        </thead>
        <tbody className="tbl-body">
          {screens.map((screen) => {
            const vm = toScreenRowVm(screen);
            const checked = selectedIds.has(screen.id);
            return (
              <tr key={screen.id} className={checked ? 'bg-blue-50/60' : ''}>
                <td className="px-4">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(screen.id)}
                    className="rounded cursor-pointer"
                  />
                </td>
                <td>
                  <p className="text-sm font-medium text-slate-900">{vm.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{vm.slug}</p>
                </td>
                <td className="text-sm text-slate-500">
                  {screen.playlist
                    ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{screen.playlist.value}</span>
                    : <span className="text-slate-300">—</span>
                  }
                </td>
                <td className="text-sm text-slate-600">{vm.location || '—'}</td>
                <td><StatusBadge status={vm.status} /></td>
                <td className="text-xs text-slate-400 tabular-nums">{vm.lastSeen !== '—' ? vm.lastSeen.replace('T', ' ').slice(0, 16) : '—'}</td>
                <td className="px-3">
                  <ScreenActionsMenu screen={screen} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer: pagination + count */}
      {meta && (
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--apple-separator)', background: 'rgba(249,249,251,0.7)' }}>
          <p className="text-xs" style={{ color: 'var(--apple-label)' }}>
            {meta.total} écran{meta.total > 1 ? 's' : ''} • page {meta.currentPage}/{meta.lastPage}
          </p>
          {meta.lastPage > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={meta.currentPage <= 1}
                onClick={() => onPageChange?.(meta.currentPage - 1)}
                className="btn-secondary text-xs px-3 py-1"
              >← Préc.</button>
              <button
                type="button"
                disabled={meta.currentPage >= meta.lastPage}
                onClick={() => onPageChange?.(meta.currentPage + 1)}
                className="btn-secondary text-xs px-3 py-1"
              >Suiv. →</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
