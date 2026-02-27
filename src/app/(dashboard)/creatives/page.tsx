'use client';

import { useState } from 'react';
import { CreativesTable } from '@/modules/creatives/presentation/components/creatives-table';
import { CreativesGrid } from '@/modules/creatives/presentation/components/creatives-grid';
import { CreativeCreateModal } from '@/modules/creatives/presentation/components/creative-create-modal';
import { SelectField } from '@/shared/ui/select-field';
import { useOptionsQuery } from '@/shared/application/use-options-query';

export default function CreativesPage() {
  const [search, setSearch] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const { data: campaigns = [], isLoading: loadingCampaigns } = useOptionsQuery('campaigns');

  const isActive = status === 'all' ? undefined : status === 'active';

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleCampaign = (v: string) => { setCampaignId(v); setPage(1); };
  const handleStatus = (v: 'all' | 'active' | 'inactive') => { setStatus(v); setPage(1); };

  return (
    <>
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Créatives</h1>
          <p className="text-sm text-slate-500 mt-0.5">Médias publicitaires diffusés sur les écrans</p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="toolbar">
          {/* Search */}
          <div className="relative w-52 shrink-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une créative…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          {/* Campaign filter */}
          <div className="w-64 shrink-0">
            <SelectField
              instanceId="creatives-campaign"
              options={campaigns}
              value={campaignId}
              onChange={handleCampaign}
              placeholder="Toutes les campagnes"
              isLoading={loadingCampaigns}
            />
          </div>

          {/* Status filter */}
          <div className="w-36 shrink-0">
            <select
              value={status}
              onChange={(e) => handleStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="input"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="relative flex items-center bg-slate-100 rounded-apple p-0.5 gap-0.5 ml-auto">
            {/* Sliding pill */}
            <span
              aria-hidden
              className="absolute top-0.5 bottom-0.5 rounded-[8px] bg-white shadow-sm transition-transform duration-200"
              style={{
                width: 'calc(50% - 2px)',
                left: '2px',
                transform: viewMode === 'grid' ? 'translateX(calc(100% + 4px))' : 'translateX(0)',
                transition: 'transform 220ms cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
            {/* Table button */}
            <button
              type="button"
              onClick={() => { setViewMode('table'); setPage(1); }}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors ${viewMode === 'table' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" />
              </svg>
              Liste
            </button>
            {/* Grid button */}
            <button
              type="button"
              onClick={() => { setViewMode('grid'); setPage(1); }}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors ${viewMode === 'grid' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Grille
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <CreativesTable
            search={search || undefined}
            campaignId={campaignId || undefined}
            isActive={isActive}
            page={page}
            onPageChange={setPage}
          />
        ) : (
          <CreativesGrid
            search={search || undefined}
            campaignId={campaignId || undefined}
            isActive={isActive}
            page={page}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>

    {createOpen && <CreativeCreateModal onClose={() => setCreateOpen(false)} />}
    </>
  );
}
