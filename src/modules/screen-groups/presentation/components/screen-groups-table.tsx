'use client';

import { useState } from 'react';
import { useScreenGroupsQuery } from '../hooks/use-screen-groups-query';
import { ScreenGroupActionsMenu } from './screen-group-actions-menu';
import { ScreenGroupFormModal } from './screen-group-form-modal';

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100/80">
      {[180, 60, 140, 120].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="skeleton h-3.5" style={{ width: w }} />
        </td>
      ))}
      <td className="px-4 py-4"><div className="w-7 h-7 skeleton rounded-apple" /></td>
    </tr>
  );
}

export function ScreenGroupsTable() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError } = useScreenGroupsQuery({ search: search || undefined, page, perPage: 20 });

  const groups = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.lastPage ?? 1;

  const handleSearch = (value: string) => { setSearch(value); setPage(1); };

  return (
    <>
      <div className="toolbar">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un groupe…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary ml-auto">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouveau groupe
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="tbl-head">
            <tr>
              <th className="px-5 py-3 text-left">Nom</th>
              <th className="px-5 py-3 text-left">Écrans</th>
              <th className="px-5 py-3 text-left">Fuseau horaire</th>
              <th className="px-5 py-3 text-left">Créé le</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="tbl-body">
            {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            {isError && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-red-500">Erreur lors du chargement des groupes.</td></tr>
            )}
            {!isLoading && !isError && groups.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">Aucun groupe trouvé.</td></tr>
            )}
            {groups.map((group) => (
              <tr key={group.id} className="border-b border-slate-100/80 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{group.name}</td>
                <td className="px-5 py-3.5">
                  <span className="badge bg-blue-50 text-blue-700">{group.screensCount} écran{group.screensCount !== 1 ? 's' : ''}</span>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{group.settings?.timezone ?? '—'}</td>
                <td className="px-5 py-3.5 text-sm text-slate-500">
                  {new Date(group.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <ScreenGroupActionsMenu group={group} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">{meta?.total ?? 0} groupe{(meta?.total ?? 0) !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="btn-ghost px-2 py-1 text-xs disabled:opacity-40">‹ Précédent</button>
            <span className="text-xs text-slate-500 px-2">{page} / {totalPages}</span>
            <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="btn-ghost px-2 py-1 text-xs disabled:opacity-40">Suivant ›</button>
          </div>
        </div>
      )}

      {createOpen && <ScreenGroupFormModal onClose={() => setCreateOpen(false)} />}
    </>
  );
}
