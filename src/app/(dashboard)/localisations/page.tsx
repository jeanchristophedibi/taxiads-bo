'use client';

import { useState } from 'react';
import { LocationsTable } from '@/modules/locations/presentation/components/locations-table';
import { LocationForm } from '@/modules/locations/presentation/components/location-form';
import type { Location } from '@/modules/locations/domain/entities/location';

export default function LocalisationsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [modal, setModal] = useState<{ open: boolean; location?: Location }>({ open: false });

  const openCreate = () => setModal({ open: true, location: undefined });
  const openEdit = (location: Location) => setModal({ open: true, location });
  const closeModal = () => setModal({ open: false });

  const isActive = status === 'all' ? undefined : status === 'active';

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Localisations</h1>
          <p className="text-sm text-slate-500 mt-0.5">Points géographiques utilisés pour le ciblage des campagnes</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouvelle localisation
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="toolbar">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une localisation…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="input w-auto"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
          </select>
        </div>
        <LocationsTable search={search || undefined} isActive={isActive} onEdit={openEdit} />
      </div>

      {modal.open && <LocationForm location={modal.location} onClose={closeModal} />}
    </div>
  );
}
