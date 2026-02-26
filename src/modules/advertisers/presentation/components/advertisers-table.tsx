'use client';

import { useAdvertisersQuery } from '../hooks/use-advertisers-query';
import type { Advertiser } from '../../domain/entities/advertiser';

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100/80">
      {[140, 160, 60, 60, 60].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="skeleton h-3.5" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

interface Props {
  search?: string;
  onEdit?: (advertiser: Advertiser) => void;
}

export function AdvertisersTable({ search, onEdit }: Props) {
  const { data, isLoading, isError } = useAdvertisersQuery({ search, page: 1 });

  if (isLoading) {
    return (
      <table className="w-full">
        <thead><tr className="tbl-head">
          <th>Annonceur</th><th>Contact</th><th>Campagnes</th><th>Play logs</th>{onEdit && <th />}
        </tr></thead>
        <tbody>{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
      </table>
    );
  }

  if (isError || !data?.ok) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500 font-medium">Impossible de charger les annonceurs.</p>
      </div>
    );
  }

  const rows = data.value.data;

  if (!rows.length) {
    return (
      <div className="py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M3 7v14M21 7v14M6 21V11m4 10V11m4 10V11m4 10V11M3 7l9-4 9 4" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Aucun annonceur trouvé</p>
        <p className="text-xs text-slate-400 mt-1">Créez votre premier annonceur pour commencer.</p>
      </div>
    );
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th>Annonceur</th>
            <th>Contact</th>
            <th>Campagnes</th>
            <th>Play logs</th>
            {onEdit && <th className="w-20" />}
          </tr>
        </thead>
        <tbody className="tbl-body">
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <p className="text-sm font-semibold text-slate-900">{row.name}</p>
              </td>
              <td>
                {row.contactEmail || row.contactPhone ? (
                  <div>
                    {row.contactEmail && <p className="text-sm text-slate-600">{row.contactEmail}</p>}
                    {row.contactPhone && <p className="text-xs text-slate-400 mt-0.5">{row.contactPhone}</p>}
                  </div>
                ) : <span className="text-sm text-slate-400">—</span>}
              </td>
              <td>
                <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold tabular-nums">
                  {row.campaignsCount}
                </span>
              </td>
              <td>
                <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold tabular-nums">
                  {row.playLogsCount}
                </span>
              </td>
              {onEdit && (
                <td className="text-right">
                  <button
                    onClick={() => onEdit(row)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Modifier
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs text-slate-400">
          {data.value.meta.total} annonceur{data.value.meta.total > 1 ? 's' : ''} au total
        </p>
      </div>
    </>
  );
}
