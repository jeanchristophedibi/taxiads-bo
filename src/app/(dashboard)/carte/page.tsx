'use client';

import { useMemo, useState } from 'react';
import { ScreensMap } from '@/modules/screens/presentation/components/screens-map';
import { useScreensMapQuery } from '@/modules/screens/presentation/hooks/use-screens-map-query';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import { SelectField } from '@/shared/ui/select-field';
import type { ScreenStatus } from '@/modules/screens/domain/entities/screen';

const STATUSES: { value: ScreenStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'online', label: 'En ligne' },
  { value: 'offline', label: 'Hors ligne' },
  { value: 'uninitialized', label: 'Non initialisé' },
  { value: 'restarting', label: 'Redémarrage' },
];

export default function CartePage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ScreenStatus | ''>('');
  const [locationKey, setLocationKey] = useState('');
  const [campaignKey, setCampaignKey] = useState('');
  const [playlistKey, setPlaylistKey] = useState('');
  const [staleAfterSeconds, setStaleAfterSeconds] = useState(180);

  const { data: locations = [], isLoading: loadingLocations } = useOptionsQuery('locations');
  const { data: campaigns = [], isLoading: loadingCampaigns } = useOptionsQuery('campaigns');
  const { data: playlists = [], isLoading: loadingPlaylists } = useOptionsQuery('playlists');

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: status || undefined,
      locationKey: locationKey || undefined,
      campaignKey: campaignKey || undefined,
      playlistKey: playlistKey || undefined,
      staleAfterSeconds,
    }),
    [search, status, locationKey, campaignKey, playlistKey, staleAfterSeconds],
  );

  const { data, isLoading, isError } = useScreensMapQuery(params);
  const result = data && data.ok ? data.value : null;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Carte des écrans</h1>
          <p className="text-sm text-slate-500 mt-0.5">Position et état des écrans en quasi temps réel</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="toolbar flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un écran..."
              className="input pl-9"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ScreenStatus | '')}
            className="input w-auto"
          >
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <div className="w-52">
            <SelectField
              instanceId="map-location"
              options={locations}
              value={locationKey}
              onChange={setLocationKey}
              placeholder="Filtrer localisation"
              isLoading={loadingLocations}
            />
          </div>

          <div className="w-52">
            <SelectField
              instanceId="map-campaign"
              options={campaigns}
              value={campaignKey}
              onChange={setCampaignKey}
              placeholder="Filtrer campagne"
              isLoading={loadingCampaigns}
            />
          </div>

          <div className="w-52">
            <SelectField
              instanceId="map-playlist"
              options={playlists}
              value={playlistKey}
              onChange={setPlaylistKey}
              placeholder="Filtrer playlist"
              isLoading={loadingPlaylists}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Stale (s)</span>
            <input
              type="number"
              min={30}
              max={86400}
              value={staleAfterSeconds}
              onChange={(e) => setStaleAfterSeconds(Math.min(86400, Math.max(30, Number(e.target.value) || 180)))}
              className="input w-24"
            />
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <p>
              {isLoading
                ? 'Chargement des positions…'
                : result
                  ? `${result.meta.total} écran(s) · actualisé le ${new Date(result.meta.generatedAt).toLocaleString('fr-FR')}`
                  : 'Données indisponibles'}
            </p>
            <p>Polling: {staleAfterSeconds}s</p>
          </div>

          {isError || !data || !data.ok ? (
            <div className="h-[65vh] min-h-[420px] w-full rounded-xl border border-slate-200 bg-white flex items-center justify-center text-sm text-red-500">
              Impossible de charger la carte des écrans.
            </div>
          ) : (
            <ScreensMap items={result?.data ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}
