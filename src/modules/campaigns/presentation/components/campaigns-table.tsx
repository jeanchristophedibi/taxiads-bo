'use client';

import { useCampaignsListQuery } from '../hooks/use-campaigns-list-query';
import type { Campaign, CampaignStatus } from '../../domain/entities/campaign';

const STATUS_BADGE: Record<CampaignStatus, { bg: string; dot: string; label: string }> = {
  active:    { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Actif' },
  scheduled: { bg: 'bg-indigo-100 text-indigo-700',   dot: 'bg-indigo-500',  label: 'Planifié' },
  draft:     { bg: 'bg-slate-100 text-slate-600',     dot: 'bg-slate-400',   label: 'Brouillon' },
  paused:    { bg: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500',   label: 'Pausé' },
  completed: { bg: 'bg-violet-100 text-violet-700',   dot: 'bg-violet-500',  label: 'Terminé' },
  archived:  { bg: 'bg-slate-100 text-slate-400',     dot: 'bg-slate-300',   label: 'Archivé' },
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.draft;
  return (
    <span className={`badge ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

function fmt(date?: string | null) {
  if (!date) return '—';
  return date.slice(0, 10).split('-').reverse().join('/');
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100/80">
      {[160, 120, 80, 80, 120, 60].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="skeleton h-3.5" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

interface Props {
  search?: string;
  status?: CampaignStatus;
  page?: number;
  onPageChange?: (page: number) => void;
  onEdit?: (campaign: Campaign) => void;
  onTargeting?: (campaign: Campaign) => void;
}

export function CampaignsTable({ search, status, page = 1, onPageChange, onEdit, onTargeting }: Props) {
  const { data, isLoading, isError } = useCampaignsListQuery({ search, status, page, perPage: 20 });
  const hasActions = !!(onEdit || onTargeting);

  if (isLoading) {
    return (
      <table className="w-full">
        <thead><tr className="tbl-head">
          <th>Campagne</th><th>Annonceur</th><th>Statut</th>
          <th>Budget</th><th>Période</th>{hasActions && <th />}
        </tr></thead>
        <tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
      </table>
    );
  }

  if (isError || !data?.ok) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500 font-medium">Impossible de charger les campagnes.</p>
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
            <path d="M3 11l19-9-9 19-2-8-8-2z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Aucune campagne trouvée</p>
        <p className="text-xs text-slate-400 mt-1">Modifiez vos filtres ou créez une nouvelle campagne.</p>
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
            <th>Campagne</th>
            <th>Annonceur</th>
            <th>Statut</th>
            <th>Budget</th>
            <th>Période</th>
            {hasActions && <th className="w-24" />}
          </tr>
        </thead>
        <tbody className="tbl-body">
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <p className="text-sm font-medium text-slate-900">{row.name}</p>
                {row.objective && <p className="text-xs text-slate-400 mt-0.5">{row.objective}</p>}
              </td>
              <td className="text-sm text-slate-600">{row.advertiser?.value ?? '—'}</td>
              <td><StatusBadge status={row.status} /></td>
              <td className="text-sm text-slate-600 tabular-nums">
                {row.budget ? `${Number(row.budget).toLocaleString('fr-FR')} XOF` : '—'}
              </td>
              <td className="text-xs text-slate-500 tabular-nums">
                {fmt(row.startsAt)} → {fmt(row.endsAt)}
              </td>
              {hasActions && (
                <td className="text-right">
                  <div className="inline-flex items-center gap-1">
                    {onTargeting && (
                      <button
                        onClick={() => onTargeting(row)}
                        className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        Ciblage
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

      {/* Pagination footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          {meta.total} campagne{meta.total > 1 ? 's' : ''} · page {meta.currentPage}/{meta.lastPage}
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
