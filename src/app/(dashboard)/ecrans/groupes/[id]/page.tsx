'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ScreensTable } from '@/modules/screens/presentation/components/screens-table';
import { ScreensGrid } from '@/modules/screens/presentation/components/screens-grid';
import { useScreenGroupQuery } from '@/modules/screen-groups/presentation/hooks/use-screen-group-query';
import { ScreenGroupFormModal } from '@/modules/screen-groups/presentation/components/screen-group-form-modal';
import type { ScreenStatus } from '@/modules/screens/domain/entities/screen';

type ViewMode = 'table' | 'grid';

const STATUS_FILTERS: { value: ScreenStatus | ''; label: string; dot?: string; active: string; inactive: string }[] = [
  { value: '',              label: 'Tous',           active: 'bg-slate-800 text-white',          inactive: 'bg-slate-100 text-slate-500 hover:bg-slate-200' },
  { value: 'online',        label: 'En ligne',       dot: 'bg-emerald-500', active: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300', inactive: 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700' },
  { value: 'offline',       label: 'Hors ligne',     dot: 'bg-red-500',     active: 'bg-red-100 text-red-600 ring-1 ring-red-300',             inactive: 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600' },
  { value: 'uninitialized', label: 'Non initialisé', dot: 'bg-slate-400',   active: 'bg-slate-200 text-slate-700 ring-1 ring-slate-300',       inactive: 'bg-slate-100 text-slate-500 hover:bg-slate-200' },
  { value: 'restarting',    label: 'Redémarrage',    dot: 'bg-amber-500',   active: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300',       inactive: 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-700' },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-b-0">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}

export default function ScreenGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: group, isLoading: groupLoading } = useScreenGroupQuery(id);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ScreenStatus | ''>('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [page, setPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);

  const handleSearchChange = (value: string) => { setSearch(value); setPage(1); };
  const handleStatusChange = (value: ScreenStatus | '') => { setStatus(value); setPage(1); };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/ecrans" className="hover:text-slate-700 transition-colors">Écrans</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        <span className="text-slate-700 font-medium">{groupLoading ? '…' : group?.name}</span>
      </div>

      {/* Group info card */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-apple bg-blue-50 flex items-center justify-center shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div>
              {groupLoading
                ? <div className="skeleton h-5 w-36 rounded mb-1" />
                : <h1 className="text-base font-semibold text-slate-900">{group?.name}</h1>
              }
              <p className="text-xs text-slate-400">Groupe d'écrans</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="btn-secondary"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* KPI — nb écrans */}
          <div className="px-5 py-4 flex flex-col gap-0.5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Écrans</span>
            {groupLoading
              ? <div className="skeleton h-8 w-12 rounded mt-1" />
              : <span className="text-2xl font-bold text-slate-900">{group?.screensCount ?? '—'}</span>
            }
          </div>

          {/* Timezone */}
          <div className="px-5 py-4 flex flex-col gap-0.5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Fuseau horaire</span>
            {groupLoading
              ? <div className="skeleton h-5 w-32 rounded mt-1.5" />
              : <span className="text-sm font-medium text-slate-700 mt-1">{group?.settings?.timezone ?? <span className="text-slate-400">—</span>}</span>
            }
          </div>

          {/* Dates */}
          <div className="px-5 py-4 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Dates</span>
            {groupLoading
              ? <>
                  <div className="skeleton h-3.5 w-40 rounded" />
                  <div className="skeleton h-3.5 w-36 rounded" />
                </>
              : <>
                  <p className="text-xs text-slate-500">Créé le <span className="text-slate-700 font-medium">{group ? fmtDate(group.createdAt) : '—'}</span></p>
                  <p className="text-xs text-slate-500">Modifié le <span className="text-slate-700 font-medium">{group ? fmtDate(group.updatedAt) : '—'}</span></p>
                </>
            }
          </div>
        </div>
      </div>

      {/* Screens card */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Écrans du groupe</h2>
        </div>

        <div className="toolbar">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un écran…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input pl-9"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => handleStatusChange(f.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-apple text-xs font-medium transition-colors ${status === f.value ? f.active : f.inactive}`}
              >
                {f.dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${f.dot}`} />}
                {f.label}
              </button>
            ))}
          </div>

          <div className="ml-auto relative flex items-center bg-slate-100 rounded-apple p-0.5 gap-0">
            <span
              aria-hidden
              className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-white rounded-[8px] shadow-sm pointer-events-none"
              style={{
                transform: viewMode === 'grid' ? 'translateX(calc(100% + 4px))' : 'translateX(0)',
                transition: 'transform 220ms cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Vue tableau"
              className={`relative z-10 p-1.5 rounded-[8px] transition-colors duration-150 ${viewMode === 'table' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Vue grille"
              className={`relative z-10 p-1.5 rounded-[8px] transition-colors duration-150 ${viewMode === 'grid' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <ScreensTable search={search || undefined} status={status || undefined} groupId={id} page={page} onPageChange={setPage} />
        ) : (
          <ScreensGrid search={search || undefined} status={status || undefined} groupId={id} page={page} onPageChange={setPage} />
        )}
      </div>

      {editOpen && group && <ScreenGroupFormModal group={group} onClose={() => setEditOpen(false)} />}
    </div>
  );
}
