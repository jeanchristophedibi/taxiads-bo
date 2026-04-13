'use client';

import { useLocationsQuery } from '../hooks/use-locations-query';
import type { Location } from '../../domain/entities/location';

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100/80">
      {[130, 100, 80, 70, 90, 50].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="skeleton h-3.5" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

interface Props {
  search?: string;
  isActive?: boolean;
  onEdit?: (location: Location) => void;
}

export function LocationsTable({ search, isActive, onEdit }: Props) {
  const { data, isLoading, isError } = useLocationsQuery({ search, isActive, page: 1 });

  if (isLoading) {
    return (
      <div className="overflow-x-auto"><table className="w-full">
        <thead><tr className="tbl-head">
          <th>Nom</th><th>Ville / Pays</th><th>Type</th><th>Statut</th><th>Utilisation</th>{onEdit && <th />}
        </tr></thead>
        <tbody>{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
      </table></div>
    );
  }

  if (isError || !data?.ok) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500 font-medium">Impossible de charger les localisations.</p>
      </div>
    );
  }

  const rows = data.value.data;

  if (!rows.length) {
    return (
      <div className="py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Aucune localisation trouvée</p>
        <p className="text-xs text-slate-400 mt-1">Ajustez vos filtres ou créez une nouvelle localisation.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto"><table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th>Nom</th>
            <th>Ville / Pays</th>
            <th>Type</th>
            <th>Statut</th>
            <th>Utilisation</th>
            {onEdit && <th className="w-20" />}
          </tr>
        </thead>
        <tbody className="tbl-body">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="text-sm font-medium text-slate-900">{row.name}</td>
              <td className="text-sm text-slate-600">
                {[row.city, row.country].filter(Boolean).join(', ') || '—'}
              </td>
              <td>
                {row.type
                  ? <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">{row.type}</span>
                  : <span className="text-sm text-slate-400">—</span>
                }
              </td>
              <td>
                <span className={`badge ${row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${row.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {row.isActive ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span title="Campagnes" className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-[10px]">C</span>
                    {row.campaignsCount}
                  </span>
                  <span title="Playlists" className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-violet-100 text-violet-600 flex items-center justify-center font-semibold text-[10px]">P</span>
                    {row.playlistsCount}
                  </span>
                  <span title="Écrans" className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-[10px]">E</span>
                    {row.screensCount}
                  </span>
                </div>
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
      </table></div>
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs text-slate-400">
          {data.value.meta.total} localisation{data.value.meta.total > 1 ? 's' : ''} au total
        </p>
      </div>
    </>
  );
}
