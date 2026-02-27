'use client';

import { useCreativesQuery } from '../hooks/use-creatives-query';
import { useToggleCreativeMutation } from '../hooks/use-creative-mutations';
import { CreativeActionsMenu } from './creative-actions-menu';
import { useToast } from '@/shared/ui/toast-provider';
import type { Creative } from '../../domain/entities/creative';

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

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function OrientationBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-300">—</span>;
  const isPortrait = value === 'portrait';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={isPortrait ? {} : { transform: 'rotate(90deg)' }}>
        <rect x="5" y="2" width="14" height="20" rx="2" />
      </svg>
      {isPortrait ? 'Portrait' : value === 'landscape' ? 'Paysage' : value}
    </span>
  );
}

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

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100/80">
      {[220, 120, 80, 50, 80, 36, 28].map((w, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="skeleton h-3.5" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

/* ─── Table ──────────────────────────────────────────────────────────────── */
interface Props {
  search?: string;
  campaignId?: string;
  isActive?: boolean;
  page?: number;
  onPageChange?: (p: number) => void;
}

export function CreativesTable({ search, campaignId, isActive, page = 1, onPageChange }: Props) {
  const { data, isLoading, isError } = useCreativesQuery({ search, campaignId, isActive, page });

  if (isLoading) {
    return (
      <div className="overflow-x-auto"><table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th>Créative</th><th>Campagne</th><th>Format</th>
            <th>Durée</th><th>Usage</th><th>Actif</th><th className="w-10" />
          </tr>
        </thead>
        <tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
      </table></div>
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
      <div className="overflow-x-auto"><table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th>Créative</th>
            <th>Campagne</th>
            <th>Format</th>
            <th>Durée</th>
            <th>Usage</th>
            <th>Actif</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="tbl-body">
          {rows.map((row) => {
            const type = mediaType(row.mediaPath);
            return (
              <tr key={row.id}>
                {/* Créative */}
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-apple flex items-center justify-center shrink-0 ${type === 'video' ? 'bg-purple-50' : type === 'image' ? 'bg-blue-50' : 'bg-slate-100'}`}>
                      {type === 'video' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#9333ea"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      ) : type === 'image' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[240px]">{row.name}</p>
                      {row.mediaPath && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[240px]" title={row.mediaPath}>
                          {row.mediaPath.split('/').pop()}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Campagne */}
                <td>
                  {row.campaign
                    ? <span className="badge bg-sky-50 text-sky-700">{row.campaign.value}</span>
                    : <span className="text-slate-300">—</span>}
                </td>

                {/* Format */}
                <td><OrientationBadge value={row.orientation} /></td>

                {/* Durée */}
                <td className="text-sm font-medium tabular-nums text-slate-600">
                  {formatDuration(row.duration)}
                </td>

                {/* Usage */}
                <td>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1" title="Éléments de playlist">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M3 12h12M3 18h12M16 16l5-4-5-4v8z" />
                      </svg>
                      {row.playlistItemsCount}
                    </span>
                    <span className="inline-flex items-center gap-1" title="Diffusions">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {row.playLogsCount}
                    </span>
                  </div>
                </td>

                {/* Toggle */}
                <td><ActiveToggle creative={row} /></td>

                {/* Actions */}
                <td className="px-3"><CreativeActionsMenu creative={row} /></td>
              </tr>
            );
          })}
        </tbody>
      </table></div>

      {/* Footer */}
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
