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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Localisations</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvelle localisation
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <LocationsTable search={search || undefined} isActive={isActive} onEdit={openEdit} />
      </div>

      {modal.open && <LocationForm location={modal.location} onClose={closeModal} />}
    </div>
  );
}
