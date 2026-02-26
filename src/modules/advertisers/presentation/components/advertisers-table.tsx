'use client';

import { useAdvertisersQuery } from '../hooks/use-advertisers-query';
import type { Advertiser } from '../../domain/entities/advertiser';

interface Props {
  search?: string;
  onEdit?: (advertiser: Advertiser) => void;
}

export function AdvertisersTable({ search, onEdit }: Props) {
  const { data, isLoading, isError } = useAdvertisersQuery({ search, page: 1 });

  if (isLoading) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Chargement…</div>;
  }

  if (isError || !data || !data.ok) {
    return <div className="px-5 py-12 text-center text-sm text-red-500">Impossible de charger les annonceurs.</div>;
  }

  const rows = data.value.data;

  if (!rows.length) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Aucun annonceur trouvé.</div>;
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Annonceur</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Campagnes</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Play Logs</th>
            {onEdit && <th className="px-5 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3">
                <div className="text-sm font-medium text-slate-900">{row.name}</div>
              </td>
              <td className="px-5 py-3 text-sm text-slate-500">
                {row.contactEmail || row.contactPhone ? (
                  <div className="space-y-0.5">
                    {row.contactEmail && <div>{row.contactEmail}</div>}
                    {row.contactPhone && <div className="text-xs text-slate-400">{row.contactPhone}</div>}
                  </div>
                ) : '—'}
              </td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.campaignsCount}</td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.playLogsCount}</td>
              {onEdit && (
                <td className="px-5 py-3 text-right">
                  <button onClick={() => onEdit(row)} className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
                    Modifier
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
        {data.value.meta.total} annonceur{data.value.meta.total > 1 ? 's' : ''} au total
      </div>
    </>
  );
}
