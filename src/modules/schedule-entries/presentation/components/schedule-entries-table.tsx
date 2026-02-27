'use client';

import { useScheduleEntriesQuery } from '../hooks/use-schedule-entries-query';
import { ScheduleEntryActionsMenu } from './schedule-entry-actions-menu';
import type { ListScheduleEntriesQuery } from '../../infrastructure/repositories/http-schedule-entry-repository';

interface Props extends Omit<ListScheduleEntriesQuery, 'perPage'> {
  page: number;
  onPageChange: (page: number) => void;
}

const fmtDatetime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'UTC',
  });

export function ScheduleEntriesTable({ page, onPageChange, ...filters }: Props) {
  const { data, isLoading, isError } = useScheduleEntriesQuery({ ...filters, page, perPage: 20 });

  if (isError) {
    return (
      <div className="card flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-red-500">Impossible de charger les programmes.</p>
      </div>
    );
  }

  const entries = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto"><table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th className="text-left px-5 py-3">Titre</th>
            <th className="text-left px-5 py-3">Salle</th>
            <th className="text-left px-5 py-3">Type</th>
            <th className="text-left px-5 py-3">Organisateur</th>
            <th className="text-left px-5 py-3 whitespace-nowrap">Période</th>
            <th className="text-left px-5 py-3">Statut</th>
            <th className="px-3 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="tbl-body">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-3"><div className="skeleton h-3.5 w-40 rounded" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-3 w-24 rounded" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-3 w-24 rounded" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-3 w-24 rounded" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-3 w-44 rounded" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-20 rounded-full" /></td>
                  <td className="px-3 py-3" />
                </tr>
              ))
            : entries.length === 0
            ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <p className="text-sm font-medium text-slate-600">Aucun programme trouvé</p>
                    <p className="text-xs text-slate-400 mt-1">Ajustez les filtres ou créez une entrée.</p>
                  </td>
                </tr>
              )
            : entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-900">{entry.title}</p>
                    {entry.message && <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{entry.message}</p>}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{entry.room?.value ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{entry.scheduleType?.value ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{entry.scheduleOrganizer?.value ?? '—'}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500">
                    <span>{fmtDatetime(entry.startsAt)}</span>
                    <span className="mx-1.5 text-slate-300">→</span>
                    <span>{fmtDatetime(entry.endsAt)}</span>
                  </td>
                  <td className="px-5 py-3">
                    {entry.isActiveNow
                      ? <span className="badge bg-emerald-50 text-emerald-700">Actif</span>
                      : <span className="badge bg-slate-100 text-slate-500">Inactif</span>}
                  </td>
                  <td className="px-3 py-3">
                    <ScheduleEntryActionsMenu scheduleEntry={entry} />
                  </td>
                </tr>
              ))}
        </tbody>
      </table></div>

      {meta && meta.lastPage > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--apple-separator)', background: 'rgba(249,249,251,0.7)' }}>
          <p className="text-xs" style={{ color: 'var(--apple-label)' }}>
            {meta.total} programme{meta.total > 1 ? 's' : ''} · page {meta.currentPage}/{meta.lastPage}
          </p>
          <div className="flex gap-1">
            <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="btn-secondary disabled:opacity-40">Précédent</button>
            <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= meta.lastPage} className="btn-secondary disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}
