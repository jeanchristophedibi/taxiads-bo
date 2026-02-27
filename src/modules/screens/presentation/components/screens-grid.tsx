'use client';

import { useState } from 'react';
import type { Screen, ScreenStatus } from '../../domain/entities/screen';
import { useScreensListQuery } from '../hooks/use-screens-list-query';
import { toScreenRowVm } from '../view-models/screen-view-model';
import { ScreenActionsMenu } from './screen-actions-menu';
import { ScreenEditModal } from './screen-edit-modal';
import { BulkBar } from './bulk-bar';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} jour${days > 1 ? 's' : ''}`;
}

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS_BADGE: Record<string, { bg: string; dot: string; label: string }> = {
  online:        { bg: 'bg-emerald-500/90',  dot: 'bg-white',     label: 'En ligne' },
  offline:       { bg: 'bg-red-500/90',      dot: 'bg-white',     label: 'Hors ligne' },
  restarting:    { bg: 'bg-amber-500/90',    dot: 'bg-white',     label: 'Redémarrage' },
  uninitialized: { bg: 'bg-slate-500/80',    dot: 'bg-white/70',  label: 'Non initialisé' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.uninitialized;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold text-white backdrop-blur-sm ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* ─── Skeleton card ──────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-video bg-slate-100 skeleton" />
      <div className="p-3 space-y-2.5">
        <div className="skeleton h-4 w-2/3" />
        <div className="space-y-1.5">
          <div className="skeleton h-3 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
          <div className="skeleton h-3 w-2/3" />
        </div>
        <div className="pt-2 border-t border-slate-100 flex gap-3">
          <div className="skeleton h-3.5 w-14" />
        </div>
      </div>
    </div>
  );
}

/* ─── Screen card ────────────────────────────────────────────────────────── */
function ScreenCard({
  screen,
  checked,
  onToggle,
}: {
  screen: Screen;
  checked: boolean;
  onToggle: () => void;
}) {
  const vm = toScreenRowVm(screen);
  const [editOpen, setEditOpen] = useState(false);
  const hasPlaylist = !!screen.playlist;

  return (
    <>
      <div className={`card overflow-hidden transition-all ${checked ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}>

        {/* ── Screen preview area ────────────────────────────────────────── */}
        <div className="relative aspect-video bg-[#0d0f14] overflow-hidden select-none">
          {/* Status badge — top left */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <StatusBadge status={vm.status} />
          </div>

          {/* Checkbox — top right */}
          <label className="absolute top-2.5 right-2.5 z-10 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={onToggle}
              className="rounded cursor-pointer accent-blue-500"
            />
          </label>

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {hasPlaylist ? (
              <p className="text-sm text-white/25 select-none">Aucun média actif</p>
            ) : (
              <p className="text-sm text-white/20 select-none">Diffusion éteinte</p>
            )}
          </div>

          {/* No-playlist indicator — bottom center */}
          {!hasPlaylist && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/30">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                Aucune playlist assignée
              </span>
            </div>
          )}
        </div>

        {/* ── Card body ─────────────────────────────────────────────────── */}
        <div className="p-3">
          {/* Screen name */}
          <p className="text-sm font-semibold text-slate-900 truncate mb-2">{vm.name}</p>

          {/* Metadata rows */}
          <div className="space-y-1 text-xs mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 shrink-0">Playlist :</span>
              <span className={`truncate ${hasPlaylist ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                {screen.playlist?.value ?? '—'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 shrink-0">En cours :</span>
              <span className="text-slate-400 truncate">—</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 shrink-0">Dernier ping :</span>
              <span className="text-slate-600">
                {vm.lastSeen !== '—' ? timeAgo(vm.lastSeen) : 'Jamais'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-xs font-medium transition-opacity"
              style={{ color: 'var(--apple-blue)' }}
            >
              Modifier
            </button>
            <div className="ml-auto -mr-1">
              <ScreenActionsMenu screen={screen} />
            </div>
          </div>
        </div>
      </div>

      {editOpen && <ScreenEditModal screen={screen} onClose={() => setEditOpen(false)} />}
    </>
  );
}

/* ─── Grid component ─────────────────────────────────────────────────────── */
interface Props {
  search?: string;
  status?: ScreenStatus;
  groupId?: string;
  page?: number;
  onPageChange?: (page: number) => void;
}

export function ScreensGrid({ search, status, groupId, page = 1, onPageChange }: Props) {
  const { data, isLoading, isError } = useScreensListQuery({ search, status, groupId, page, perPage: 20 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setSelectedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const screens = data?.ok ? data.value.data : [];
  const meta    = data?.ok ? data.value.meta : null;

  if (isLoading) {
    return (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
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

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {screens.map((screen) => (
          <ScreenCard
            key={screen.id}
            screen={screen}
            checked={selectedIds.has(screen.id)}
            onToggle={() => toggle(screen.id)}
          />
        ))}
      </div>

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
