'use client';

import { useCreativesQuery } from '../hooks/use-creatives-query';

interface Props {
  search?: string;
  campaignId?: string;
  isActive?: boolean;
}

export function CreativesTable({ search, campaignId, isActive }: Props) {
  const { data, isLoading, isError } = useCreativesQuery({ search, campaignId, isActive, page: 1 });

  if (isLoading) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Chargement…</div>;
  }

  if (isError || !data || !data.ok) {
    return <div className="px-5 py-12 text-center text-sm text-red-500">Impossible de charger les créatives.</div>;
  }

  const rows = data.value.data;

  if (!rows.length) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Aucune créative trouvée.</div>;
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Créative</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Campagne</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Format</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durée</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usage</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3">
                <div className="text-sm font-medium text-slate-900">{row.name}</div>
                {row.mediaPath && <div className="text-xs text-slate-400 truncate max-w-[280px]">{row.mediaPath}</div>}
              </td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.campaign?.value ?? '—'}</td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.orientation || '—'}</td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.duration ? `${row.duration}s` : '—'}</td>
              <td className="px-5 py-3 text-xs text-slate-500">Playlist {row.playlistItemsCount} · Logs {row.playLogsCount}</td>
              <td className="px-5 py-3 text-sm">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {row.isActive ? 'active' : 'inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
        {data.value.meta.total} créative{data.value.meta.total > 1 ? 's' : ''} au total
      </div>
    </>
  );
}
