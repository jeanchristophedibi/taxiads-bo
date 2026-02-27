'use client';

import { useState } from 'react';
import type { Creative } from '../../domain/entities/creative';
import { useCreativesQuery } from '../hooks/use-creatives-query';
import { useToggleCreativeMutation } from '../hooks/use-creative-mutations';
import { CreativeActionsMenu } from './creative-actions-menu';
import { CreativeEditModal } from './creative-edit-modal';
import { useToast } from '@/shared/ui/toast-provider';
import type { ListCreativesQuery } from '../../infrastructure/repositories/http-creative-repository';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function mediaType(path: string | null): 'video' | 'image' | 'unknown' {
  if (!path) return 'unknown';
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  return 'unknown';
}

function formatDuration(s: number | null): string {
  if (!s) return '—';
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m${s % 60 ? ` ${s % 60}s` : ''}`;
}

const storageBase =
  (process.env.NEXT_PUBLIC_STORAGE_BASE_URL ?? '') ||
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/api\/?$/, '') + '/storage';

/* ─── Active badge (mirrors screens StatusBadge) ─────────────────────────── */
function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold text-white backdrop-blur-sm ${isActive ? 'bg-emerald-500/90' : 'bg-slate-500/80'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  );
}

/* ─── Active toggle (footer) ─────────────────────────────────────────────── */
function ActiveToggle({ creative }: { creative: Creative }) {
  const toast = useToast();
  const toggle = useToggleCreativeMutation();
  return (
    <button
      type="button"
      onClick={() => toggle.mutate(
        { id: creative.id, isActive: !creative.isActive },
        {
          onSuccess: (res) => { if (res && !res.ok) toast.error('Statut', (res.error as { message: string })?.message); },
          onError: (err) => toast.error('Statut', (err as Error).message),
        },
      )}
      disabled={toggle.isPending}
      title={creative.isActive ? 'Désactiver' : 'Activer'}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${creative.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${creative.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
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

/* ─── Creative card ──────────────────────────────────────────────────────── */
function CreativeCard({ creative }: { creative: Creative }) {
  const type = mediaType(creative.mediaPath);
  const [imgError, setImgError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const imgSrc =
    type === 'image' && creative.mediaPath && !imgError
      ? `${storageBase}/${creative.mediaPath}`
      : null;

  return (
    <>
      <div className="card overflow-hidden">

        {/* ── Preview area (mirrors screens dark zone) ──────────────────── */}
        <div className="relative aspect-video bg-[#0d0f14] overflow-hidden select-none">

          {/* Image preview */}
          {imgSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt=""
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Active badge — top left */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <ActiveBadge isActive={creative.isActive} />
          </div>

          {/* Center placeholder */}
          {!imgSrc && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              {type === 'video' ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                  <p className="text-[11px] text-white/25 select-none">Vidéo</p>
                </>
              ) : (
                <p className="text-sm text-white/20 select-none">Aucun aperçu</p>
              )}
            </div>
          )}

          {/* Duration chip — bottom right */}
          {creative.duration && (
            <div className="absolute bottom-2.5 right-2.5 z-10">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono text-white/70 bg-black/40 backdrop-blur-sm">
                {formatDuration(creative.duration)}
              </span>
            </div>
          )}
        </div>

        {/* ── Card body (mirrors screens card body) ─────────────────────── */}
        <div className="p-3">
          <p className="text-sm font-semibold text-slate-900 truncate mb-2" title={creative.name}>
            {creative.name}
          </p>

          <div className="space-y-1 text-xs mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 shrink-0">Campagne :</span>
              <span className={`truncate ${creative.campaign ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                {creative.campaign?.value ?? '—'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 shrink-0">Format :</span>
              <span className="text-slate-600">
                {creative.orientation ?? '—'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 shrink-0">Usage :</span>
              <span className="text-slate-600">
                {creative.playlistItemsCount} playlist{creative.playlistItemsCount > 1 ? 's' : ''} · {creative.playLogsCount} diffusion{creative.playLogsCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Footer actions (mirrors screens footer) */}
          <div className="flex items-center gap-3 pt-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="text-xs font-medium transition-opacity"
              style={{ color: 'var(--apple-blue)' }}
            >
              Modifier
            </button>
            <div className="ml-auto flex items-center gap-1.5 -mr-1">
              <ActiveToggle creative={creative} />
              <CreativeActionsMenu creative={creative} />
            </div>
          </div>
        </div>
      </div>

      {editOpen && <CreativeEditModal creative={creative} onClose={() => setEditOpen(false)} />}
    </>
  );
}

/* ─── Grid component ─────────────────────────────────────────────────────── */
interface Props extends ListCreativesQuery {
  page?: number;
  onPageChange?: (page: number) => void;
}

export function CreativesGrid({ page = 1, onPageChange, ...filters }: Props) {
  const { data, isLoading, isError } = useCreativesQuery({ ...filters, page });

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
        <p className="text-sm text-red-500 font-medium">Impossible de charger les créatives.</p>
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
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Aucune créative trouvée</p>
        <p className="text-xs text-slate-400 mt-1">Ajustez vos filtres pour voir des résultats.</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {rows.map((creative) => (
          <CreativeCard key={creative.id} creative={creative} />
        ))}
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--apple-separator)', background: 'rgba(249,249,251,0.7)' }}>
        <p className="text-xs" style={{ color: 'var(--apple-label)' }}>
          {meta.total} créative{meta.total > 1 ? 's' : ''} • page {meta.currentPage}/{meta.lastPage}
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
