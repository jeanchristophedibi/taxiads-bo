'use client';

import { useState } from 'react';
import { ScreensTable } from '@/modules/screens/presentation/components/screens-table';
import { ScreensGrid } from '@/modules/screens/presentation/components/screens-grid';
import { ScreenGroupsTable } from '@/modules/screen-groups/presentation/components/screen-groups-table';
import type { ScreenStatus } from '@/modules/screens/domain/entities/screen';

type ViewMode = 'table' | 'grid';
type Tab = 'screens' | 'groups';

const STATUS_FILTERS: { value: ScreenStatus | ''; label: string; dot?: string; active: string; inactive: string }[] = [
  { value: '',              label: 'Tous',           active: 'bg-slate-800 text-white',          inactive: 'bg-slate-100 text-slate-500 hover:bg-slate-200' },
  { value: 'online',        label: 'En ligne',       dot: 'bg-emerald-500', active: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300', inactive: 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700' },
  { value: 'offline',       label: 'Hors ligne',     dot: 'bg-red-500',     active: 'bg-red-100 text-red-600 ring-1 ring-red-300',             inactive: 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600' },
  { value: 'uninitialized', label: 'Non initialisé', dot: 'bg-slate-400',   active: 'bg-slate-200 text-slate-700 ring-1 ring-slate-300',       inactive: 'bg-slate-100 text-slate-500 hover:bg-slate-200' },
  { value: 'restarting',    label: 'Redémarrage',    dot: 'bg-amber-500',   active: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300',       inactive: 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-700' },
];

export default function EcransPage() {
  const [tab, setTab] = useState<Tab>('screens');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ScreenStatus | ''>('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => { setSearch(value); setPage(1); };
  const handleStatusChange = (value: ScreenStatus | '') => { setStatus(value); setPage(1); };
  const handleTabChange = (t: Tab) => { setTab(t); setSearch(''); setStatus(''); setPage(1); };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Écrans</h1>
          <p className="text-sm text-slate-500 mt-0.5">Moniteur en temps réel des dispositifs d'affichage</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            type="button"
            onClick={() => handleTabChange('screens')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'screens' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Écrans
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('groups')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'groups' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Groupes
          </button>
        </div>

        {tab === 'screens' && (
          <>
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

              {/* View mode toggle */}
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
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M3 15h18M9 3v18" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Vue grille"
                  className={`relative z-10 p-1.5 rounded-[8px] transition-colors duration-150 ${viewMode === 'grid' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </button>
              </div>
            </div>

            {viewMode === 'table' ? (
              <ScreensTable search={search || undefined} status={status || undefined} page={page} onPageChange={setPage} />
            ) : (
              <ScreensGrid search={search || undefined} status={status || undefined} page={page} onPageChange={setPage} />
            )}
          </>
        )}

        {tab === 'groups' && <ScreenGroupsTable />}
      </div>
    </div>
  );
}
