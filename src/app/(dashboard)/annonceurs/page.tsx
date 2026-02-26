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
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Annonceurs</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gérez vos annonceurs et leurs campagnes associées</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouvel annonceur
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
              placeholder="Rechercher un annonceur…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>
        <AdvertisersTable search={search || undefined} onEdit={openEdit} />
      </div>

      {modal.open && <AdvertiserForm advertiser={modal.advertiser} onClose={closeModal} />}
    </div>
  );
}
