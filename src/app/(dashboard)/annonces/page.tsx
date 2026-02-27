'use client';

import { useState } from 'react';
import { AnnouncementsTable } from '@/modules/announcements/presentation/components/announcements-table';
import { AnnouncementCreateModal } from '@/modules/announcements/presentation/components/announcement-form-modal';

export default function AnnouncesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Annonces</h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md">
              Messages diffusés sur les écrans pendant une plage horaire définie.
              Chaque annonce est automatiquement active entre sa date de début et sa date de fin.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-primary shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouvelle annonce
          </button>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Rechercher par titre ou contenu…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <AnnouncementsTable search={search || undefined} page={page} onPageChange={setPage} />
      </div>

      {createOpen && <AnnouncementCreateModal onClose={() => setCreateOpen(false)} />}
    </>
  );
}
