'use client';

import { useState } from 'react';
import { ArtworksGrid } from '@/modules/artworks/presentation/components/artworks-grid';
import { ArtworksTable } from '@/modules/artworks/presentation/components/artworks-table';
import { ArtworkCreateModal } from '@/modules/artworks/presentation/components/artwork-create-modal';
import { useAuthPermissions } from '@/shared/application/use-auth-permissions';

type ViewMode = 'grid' | 'table';

export default function ArtworksPage() {
  const { can } = useAuthPermissions();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [createOpen, setCreateOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (!can('creatives.read')) {
    return <div className="text-sm text-slate-500">Acces non autorise.</div>;
  }

  const query = { search: search || undefined };

  return (
    <>
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Artworks</h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-md">
            Bibliothèque visuelle système — images et vidéos utilisées dans les pages de diffusion
            (ex.&nbsp;ArtworkAutoplay). Chaque artwork peut exister en trois formats&nbsp;:
            horizontal&nbsp;(16:9), vertical&nbsp;(9:16) et bannière.
          </p>
        </div>
        {can('creatives.write') && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-primary shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouvel artwork
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Rechercher par nom ou artiste…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input pl-9"
          />
        </div>

        {/* View toggle */}
        <div className="relative flex items-center bg-slate-100 rounded-apple p-0.5 shrink-0 ml-auto">
          <div
            className="absolute top-0.5 bottom-0.5 rounded-[8px] bg-white shadow-sm transition-all"
            style={{
              left: viewMode === 'grid' ? '2px' : '50%',
              right: viewMode === 'grid' ? '50%' : '2px',
              transition: 'left 0.22s cubic-bezier(0.34,1.56,0.64,1), right 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />
          <button
            type="button"
            onClick={() => { setViewMode('grid'); setPage(1); }}
            className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors ${viewMode === 'grid' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Grille
          </button>
          <button
            type="button"
            onClick={() => { setViewMode('table'); setPage(1); }}
            className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors ${viewMode === 'table' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
            Liste
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid'
        ? <ArtworksGrid query={query} page={page} onPageChange={setPage} />
        : <ArtworksTable query={query} page={page} onPageChange={setPage} />
      }
    </div>

    {createOpen && can('creatives.write') && <ArtworkCreateModal onClose={() => setCreateOpen(false)} />}
    </>
  );
}
