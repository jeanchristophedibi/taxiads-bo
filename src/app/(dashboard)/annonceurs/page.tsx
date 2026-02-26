'use client';

import { useState } from 'react';
import { AdvertisersTable } from '@/modules/advertisers/presentation/components/advertisers-table';
import { AdvertiserForm } from '@/modules/advertisers/presentation/components/advertiser-form';
import type { Advertiser } from '@/modules/advertisers/domain/entities/advertiser';

export default function AnnonceursPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; advertiser?: Advertiser }>({ open: false });

  const openCreate = () => setModal({ open: true, advertiser: undefined });
  const openEdit = (advertiser: Advertiser) => setModal({ open: true, advertiser });
  const closeModal = () => setModal({ open: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Annonceurs</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvel annonceur
        </button>
      </div>

      <input
        type="text"
        placeholder="Rechercher…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <AdvertisersTable search={search || undefined} onEdit={openEdit} />
      </div>

      {modal.open && <AdvertiserForm advertiser={modal.advertiser} onClose={closeModal} />}
    </div>
  );
}
