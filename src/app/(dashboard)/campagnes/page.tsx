'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CampaignsTable } from '@/modules/campaigns/presentation/components/campaigns-table';
import { CampaignForm } from '@/modules/campaigns/presentation/components/campaign-form';
import { CampaignTargetingModal } from '@/modules/campaigns/presentation/components/campaign-targeting-modal';
import type { Campaign, CampaignStatus } from '@/modules/campaigns/domain/entities/campaign';
import { useAuthPermissions } from '@/shared/application/use-auth-permissions';

const STATUSES: { value: CampaignStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'active', label: 'Actif' },
  { value: 'scheduled', label: 'Planifié' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'paused', label: 'Pausé' },
  { value: 'completed', label: 'Terminé' },
  { value: 'archived', label: 'Archivé' },
];

const VALID_STATUSES = new Set(['active', 'scheduled', 'draft', 'paused', 'completed', 'archived']);

export default function CampagnesPage() {
  const { can } = useAuthPermissions();
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

  if (!can('campaigns.read')) {
    return <div className="text-sm text-slate-500">Acces non autorise.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Campagnes</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gérez et suivez vos campagnes publicitaires</p>
        </div>
        {can('campaigns.write') && (
          <button onClick={() => setModal({ open: true })} className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouvelle campagne
          </button>
        )}
      </div>

      {/* Card with toolbar + table */}
      <div className="card overflow-hidden">
        <div className="toolbar">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une campagne…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as CampaignStatus | '')}
            className="input w-auto"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <CampaignsTable
          search={search || undefined}
          status={status || undefined}
          page={page}
          onPageChange={onPageChange}
          onEdit={can('campaigns.write') ? (c) => setModal({ open: true, campaign: c }) : undefined}
          onTargeting={can('campaigns.write') ? (c) => setTargeting({ open: true, campaign: c }) : undefined}
        />
      </div>

      {modal.open && can('campaigns.write') && (
        <CampaignForm campaign={modal.campaign} onClose={() => setModal({ open: false })} />
      )}
      {targeting.open && targeting.campaign && can('campaigns.write') && (
        <CampaignTargetingModal campaign={targeting.campaign} onClose={() => setTargeting({ open: false })} />
      )}
    </div>
  );
}
