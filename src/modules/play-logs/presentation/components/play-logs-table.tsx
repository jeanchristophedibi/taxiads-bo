'use client';

import { usePlayLogsQuery } from '../hooks/use-play-logs-query';
import type { ListPlayLogsQuery } from '../../infrastructure/repositories/http-play-log-repository';

export function PlayLogsTable(params: ListPlayLogsQuery) {
  const { data, isLoading, isError } = usePlayLogsQuery(params);

  if (isLoading) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Chargement…</div>;
  }

  if (isError || !data || !data.ok) {
    return <div className="px-5 py-12 text-center text-sm text-red-500">Impossible de charger les play logs.</div>;
  }

  const rows = data.value.data;

  if (!rows.length) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Aucun play log trouvé.</div>;
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Écran</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Campagne</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Créatif</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durée</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 text-xs text-slate-500">{row.playedAt.slice(0, 19).replace('T', ' ')}</td>
              <td className="px-5 py-3 text-sm text-slate-700">{row.screen?.value ?? '—'}</td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.campaign?.value ?? '—'}</td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.creative?.value ?? '—'}</td>
              <td className="px-5 py-3 text-sm text-slate-400">{(row.durationMs / 1000).toFixed(1)}s</td>
              <td className="px-5 py-3">
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${row.status === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
        {data.value.meta.total} entrée{data.value.meta.total > 1 ? 's' : ''} au total
      </div>
    </>
  );
}
