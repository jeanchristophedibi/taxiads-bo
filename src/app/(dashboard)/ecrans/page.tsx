'use client';

import { useState } from 'react';
import { ScreensTable } from '@/modules/screens/presentation/components/screens-table';
import { ScreensGrid } from '@/modules/screens/presentation/components/screens-grid';
import type { ScreenStatus } from '@/modules/screens/domain/entities/screen';

type ViewMode = 'table' | 'grid';

const STATUS_OPTIONS: { value: ScreenStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'online', label: 'En ligne' },
  { value: 'offline', label: 'Hors ligne' },
  { value: 'uninitialized', label: 'Non initialisé' },
  { value: 'restarting', label: 'Redémarrage' },
];

export default function EcransPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ScreenStatus | ''>('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => { setSearch(value); setPage(1); };
  const handleStatusChange = (value: ScreenStatus | '') => { setStatus(value); setPage(1); };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Écrans</h1>
          <p className="text-sm text-slate-500 mt-0.5">Moniteur en temps réel des dispositifs d'affichage</p>
        </div>
      </div>

      <div className="card overflow-hidden">
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

          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as ScreenStatus | '')}
            className="input w-auto"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* View mode toggle — segmented control */}
          <div className="relative flex items-center bg-slate-100 rounded-apple p-0.5 gap-0">
            {/* Sliding pill */}
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
          <ScreensTable
            search={search || undefined}
            status={status || undefined}
            page={page}
            onPageChange={setPage}
          />
        ) : (
          <ScreensGrid
            search={search || undefined}
            status={status || undefined}
            page={page}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
