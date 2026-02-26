'use client';

import { useScreensListQuery } from '../hooks/use-screens-list-query';
import { toScreenRowVm } from '../view-models/screen-view-model';

const STATUS_STYLES: Record<string, string> = {
  online: 'bg-emerald-100 text-emerald-700',
  offline: 'bg-red-100 text-red-700',
  restarting: 'bg-amber-100 text-amber-700',
  uninitialized: 'bg-slate-100 text-slate-500',
};

const DOT_STYLES: Record<string, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-red-500',
  restarting: 'bg-amber-500',
  uninitialized: 'bg-slate-400',
};

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_STYLES[status] ?? STATUS_STYLES.uninitialized;
  const dot = DOT_STYLES[status] ?? DOT_STYLES.uninitialized;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

interface Props {
  search?: string;
  status?: 'online' | 'offline' | 'uninitialized' | 'restarting';
  page?: number;
}

export function ScreensTable({ search, status, page = 1 }: Props) {
  const { data, isLoading, isError } = useScreensListQuery({ search, status, page, perPage: 20 });

  if (isLoading) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Chargement des écrans…</div>;
  }

  if (isError || !data || !data.ok) {
    return <div className="px-5 py-12 text-center text-sm text-red-500">Impossible de charger les écrans.</div>;
  }

  const rows = data.value.data.map(toScreenRowVm);

  if (!rows.length) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Aucun écran trouvé.</div>;
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Écran</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Localisation</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dernier ping</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3">
                <div className="text-sm font-medium text-slate-900">{row.name}</div>
                <div className="text-xs text-slate-400">{row.slug}</div>
              </td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.location}</td>
              <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.lastSeen}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
        {data.value.meta.total} écran{data.value.meta.total > 1 ? 's' : ''} au total
      </div>
    </>
  );
}
