'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CampaignsTable } from '@/modules/campaigns/presentation/components/campaigns-table';
import { CampaignForm } from '@/modules/campaigns/presentation/components/campaign-form';
import { CampaignTargetingModal } from '@/modules/campaigns/presentation/components/campaign-targeting-modal';
import type { Campaign, CampaignStatus } from '@/modules/campaigns/domain/entities/campaign';

const STATUSES: { value: CampaignStatus | ''; label: string }[] = [
  { value: '', label: 'Tous' },
  { value: 'active', label: 'Actif' },
  { value: 'scheduled', label: 'Planifié' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'paused', label: 'Pausé' },
  { value: 'completed', label: 'Terminé' },
  { value: 'archived', label: 'Archivé' },
];

const VALID_STATUSES = new Set(['active', 'scheduled', 'draft', 'paused', 'completed', 'archived']);

export default function CampagnesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get('search') ?? '';
  const initialStatusRaw = searchParams.get('status') ?? '';
  const initialStatus = VALID_STATUSES.has(initialStatusRaw) ? (initialStatusRaw as CampaignStatus) : '';
  const initialPage = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<CampaignStatus | ''>(initialStatus);
  const [page, setPage] = useState(initialPage);

  const [modal, setModal] = useState<{ open: boolean; campaign?: Campaign }>({ open: false });
  const [targeting, setTargeting] = useState<{ open: boolean; campaign?: Campaign }>({ open: false });

  const updateUrl = useMemo(() => {
    return (next: { search?: string; status?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.search !== undefined) {
        if (next.search.trim()) params.set('search', next.search.trim());
        else params.delete('search');
      }

      if (next.status !== undefined) {
        if (next.status) params.set('status', next.status);
        else params.delete('status');
      }

      if (next.page !== undefined) {
        if (next.page > 1) params.set('page', String(next.page));
        else params.delete('page');
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    };
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
      updateUrl({ search: searchInput, page: 1 });
    }, 350);

    return () => window.clearTimeout(handle);
  }, [searchInput, updateUrl]);

  const onStatusChange = (nextStatus: CampaignStatus | '') => {
    setStatus(nextStatus);
    setPage(1);
    updateUrl({ status: nextStatus, page: 1 });
  };

  const onPageChange = (nextPage: number) => {
    setPage(nextPage);
    updateUrl({ page: nextPage });
  };

  const openCreate = () => setModal({ open: true, campaign: undefined });
  const openEdit = (campaign: Campaign) => setModal({ open: true, campaign });
  const closeModal = () => setModal({ open: false });

  const openTargeting = (campaign: Campaign) => setTargeting({ open: true, campaign });
  const closeTargeting = () => setTargeting({ open: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Campagnes</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvelle campagne
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Rechercher…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as CampaignStatus | '')}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <CampaignsTable
          search={search || undefined}
          status={status || undefined}
          page={page}
          onPageChange={onPageChange}
          onEdit={openEdit}
          onTargeting={openTargeting}
        />
      </div>

      {modal.open && (
        <CampaignForm campaign={modal.campaign} onClose={closeModal} />
      )}

      {targeting.open && targeting.campaign && (
        <CampaignTargetingModal campaign={targeting.campaign} onClose={closeTargeting} />
      )}
    </div>
  );
}
