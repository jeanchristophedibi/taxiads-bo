'use client';

import { useLocationsQuery } from '../hooks/use-locations-query';
import type { Location } from '../../domain/entities/location';

interface Props {
  search?: string;
  isActive?: boolean;
  onEdit?: (location: Location) => void;
}

export function LocationsTable({ search, isActive, onEdit }: Props) {
  const { data, isLoading, isError } = useLocationsQuery({ search, isActive, page: 1 });

  if (isLoading) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Chargement…</div>;
  }

  if (isError || !data || !data.ok) {
    return <div className="px-5 py-12 text-center text-sm text-red-500">Impossible de charger les localisations.</div>;
  }

  const rows = data.value.data;

  if (!rows.length) {
    return <div className="px-5 py-12 text-center text-sm text-slate-400">Aucune localisation trouvée.</div>;
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nom</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ville / Pays</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Utilisation</th>
            {onEdit && <th className="px-5 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 text-sm font-medium text-slate-900">{row.name}</td>
              <td className="px-5 py-3 text-sm text-slate-500">{[row.city, row.country].filter(Boolean).join(', ') || '—'}</td>
              <td className="px-5 py-3 text-sm text-slate-500">{row.type || '—'}</td>
              <td className="px-5 py-3 text-sm">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {row.isActive ? 'active' : 'inactive'}
                </span>
              </td>
              <td className="px-5 py-3 text-xs text-slate-500">
                C {row.campaignsCount} · P {row.playlistsCount} · E {row.screensCount}
              </td>
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
        {data.value.meta.total} localisation{data.value.meta.total > 1 ? 's' : ''} au total
      </div>
    </>
  );
}
