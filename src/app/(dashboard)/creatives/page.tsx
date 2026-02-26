'use client';

import { useState } from 'react';
import { CreativesTable } from '@/modules/creatives/presentation/components/creatives-table';
import { SelectField } from '@/shared/ui/select-field';
import { useOptionsQuery } from '@/shared/application/use-options-query';

export default function CreativesPage() {
  const [search, setSearch] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const { data: campaigns = [], isLoading: loadingCampaigns } = useOptionsQuery('campaigns');

  const isActive = status === 'all' ? undefined : status === 'active';

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Créatives</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <SelectField
          instanceId="creatives-campaign"
          options={campaigns}
          value={campaignId}
          onChange={setCampaignId}
          placeholder="Filtrer par campagne"
          isLoading={loadingCampaigns}
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
        <CreativesTable search={search || undefined} campaignId={campaignId || undefined} isActive={isActive} />
      </div>
    </div>
  );
}
