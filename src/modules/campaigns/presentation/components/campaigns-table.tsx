'use client';

import { useCampaignsListQuery } from '../hooks/use-campaigns-list-query';
import type { Campaign, CampaignStatus } from '../../domain/entities/campaign';

const STATUS_STYLES: Record<CampaignStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  scheduled: 'bg-blue-100 text-blue-700',
  draft: 'bg-slate-100 text-slate-500',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-purple-100 text-purple-700',
  archived: 'bg-slate-100 text-slate-400',
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
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

  if (isLoading) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Chargement…</div>;
  }

  if (isError || !data || !data.ok) {
    return <div className="px-5 py-12 text-center text-sm text-red-500">Impossible de charger les campagnes.</div>;
  }

  const rows = data.value.data;
  const meta = data.value.meta;

  if (!rows.length) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Aucune campagne trouvée.</div>;
  }

  const canPrev = meta.currentPage > 1;
  const canNext = meta.currentPage < meta.lastPage;

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Campagne</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Annonceur</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Budget</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Période</th>
            {(onEdit || onTargeting) && <th className="px-5 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3">
                <div className="text-sm font-medium text-slate-900">{row.name}</div>
                {row.objective && <div className="text-xs text-slate-400">{row.objective}</div>}
              </td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.advertiser?.value ?? '—'}</td>
              <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.budget}</td>
              <td className="px-5 py-3 text-xs text-slate-400">
                {row.startsAt ? row.startsAt.slice(0, 10) : '—'} → {row.endsAt ? row.endsAt.slice(0, 10) : '—'}
              </td>
              {(onEdit || onTargeting) && (
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-3">
                    {onTargeting && (
                      <button
                        onClick={() => onTargeting(row)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        Ciblage
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
          {meta.total} campagne{meta.total > 1 ? 's' : ''} · page {meta.currentPage}/{meta.lastPage}
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
