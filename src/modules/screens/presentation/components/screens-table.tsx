'use client';

import { useState } from 'react';
import type { ScreenStatus } from '../../domain/entities/screen';
import { useScreensListQuery } from '../hooks/use-screens-list-query';
import { toScreenRowVm } from '../view-models/screen-view-model';
import { ScreenActionsMenu } from './screen-actions-menu';
import { ScreenValidateAction } from './screen-validate-action';
import { BulkBar } from './bulk-bar';
import { useAuthPermissions } from '@/shared/application/use-auth-permissions';

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

/* ─── Table component ────────────────────────────────────────────────────── */
interface Props {
  search?: string;
  status?: ScreenStatus;
  excludeStatuses?: ScreenStatus[];
  requestsOnly?: boolean;
  groupId?: string;
  page?: number;
  onPageChange?: (page: number) => void;
}

export function ScreensTable({ search, status, excludeStatuses, requestsOnly = false, groupId, page = 1, onPageChange }: Props) {
  const { can } = useAuthPermissions();
  const canBulkActions = !requestsOnly && can('screens.bulk_actions');
  const { data, isLoading, isError } = useScreensListQuery({ search, status, groupId, page, perPage: 20 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setSelectedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const screens = (data?.ok ? data.value.data : []).filter((screen) => !excludeStatuses?.includes(screen.status));
  const meta    = data?.ok ? data.value.meta : null;
  const allChecked = screens.length > 0 && screens.every((s) => selectedIds.has(s.id));

  const toggleAll = () => {
    setSelectedIds(allChecked ? new Set() : new Set(screens.map((s) => s.id)));
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto"><table className="w-full">
        <thead><tr className="tbl-head">
          <th className="w-10" />
          <th>Écran</th><th>Localisation</th><th>Statut</th><th>Dernier ping</th><th className="w-10" />
        </tr></thead>
        <tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
      </table></div>
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
      {canBulkActions && selectedKeys.length > 0 && (
        <BulkBar selectedKeys={selectedKeys} onClear={() => setSelectedIds(new Set())} />
      )}

      <div className="overflow-x-auto"><table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th className="w-10 px-4">
              {canBulkActions && (
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="rounded cursor-pointer"
                  title="Tout sélectionner"
                />
              )}
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
                  {canBulkActions && (
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(screen.id)}
                      className="rounded cursor-pointer"
                    />
                  )}
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
                  {requestsOnly ? <ScreenValidateAction screen={screen} /> : <ScreenActionsMenu screen={screen} />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div>

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
