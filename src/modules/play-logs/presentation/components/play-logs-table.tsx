'use client';

import { usePlayLogsQuery } from '../hooks/use-play-logs-query';
import type { ListPlayLogsQuery } from '../../infrastructure/repositories/http-play-log-repository';

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100/80">
      {[130, 110, 110, 110, 60, 55].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="skeleton h-3.5" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

export function PlayLogsTable(params: ListPlayLogsQuery) {
  const { data, isLoading, isError } = usePlayLogsQuery(params);

  if (isLoading) {
    return (
      <div className="overflow-x-auto"><table className="w-full">
        <thead><tr className="tbl-head">
          <th>Date</th><th>Écran</th><th>Campagne</th><th>Créatif</th><th>Durée</th><th>Statut</th>
        </tr></thead>
        <tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
      </table></div>
    );
  }

  if (isError || !data?.ok) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500 font-medium">Impossible de charger les play logs.</p>
      </div>
    );
  }

  const rows = data.value.data;

  if (!rows.length) {
    return (
      <div className="py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Aucun play log trouvé</p>
        <p className="text-xs text-slate-400 mt-1">Aucune diffusion enregistrée pour cette période.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto"><table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th>Date</th>
            <th>Écran</th>
            <th>Campagne</th>
            <th>Créatif</th>
            <th>Durée</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody className="tbl-body">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="text-xs text-slate-500 tabular-nums font-mono">
                {row.playedAt.slice(0, 19).replace('T', ' ')}
              </td>
              <td className="text-sm font-medium text-slate-900">{row.screen?.value ?? '—'}</td>
              <td className="text-sm text-slate-600">{row.campaign?.value ?? '—'}</td>
              <td className="text-sm text-slate-600">{row.creative?.value ?? '—'}</td>
              <td className="text-sm text-slate-500 tabular-nums">
                {(row.durationMs / 1000).toFixed(1)}s
              </td>
              <td>
                <span className={`badge ${row.status === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {row.status === 'ok' ? 'OK' : 'Erreur'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs text-slate-400">
          {data.value.meta.total} diffusion{data.value.meta.total > 1 ? 's' : ''} au total
        </p>
      </div>
    </>
  );
}
