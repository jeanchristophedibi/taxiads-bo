'use client';

import { useState } from 'react';
import { PlayLogsTable } from '@/modules/play-logs/presentation/components/play-logs-table';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import { SelectField } from '@/shared/ui/select-field';

export default function PlayLogsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [screenId, setScreenId] = useState('');
  const [campaignId, setCampaignId] = useState('');

  const { data: screens = [], isLoading: loadingScreens } = useOptionsQuery('screens');
  const { data: campaigns = [], isLoading: loadingCampaigns } = useOptionsQuery('campaigns');

  const hasFilters = from || to || screenId || campaignId;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Historique des diffusions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Journal complet des diffusions publicitaires</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="toolbar flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">Du</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input w-auto"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">au</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input w-auto"
            />
          </div>

          <div className="w-56">
            <SelectField
              instanceId="playlogs-screen"
              options={screens}
              value={screenId}
              onChange={setScreenId}
              placeholder="Filtrer par écran"
              isLoading={loadingScreens}
            />
          </div>

          <div className="w-56">
            <SelectField
              instanceId="playlogs-campaign"
              options={campaigns}
              value={campaignId}
              onChange={setCampaignId}
              placeholder="Filtrer par campagne"
              isLoading={loadingCampaigns}
            />
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setFrom('');
                setTo('');
                setScreenId('');
                setCampaignId('');
              }}
              className="btn-ghost text-xs"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <PlayLogsTable
          from={from || undefined}
          to={to || undefined}
          screenId={screenId || undefined}
          campaignId={campaignId || undefined}
        />
      </div>
    </div>
  );
}
