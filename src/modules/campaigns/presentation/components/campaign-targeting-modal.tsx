'use client';

import { useEffect, useState } from 'react';
import type { Campaign } from '../../domain/entities/campaign';
import { useCampaignLocationsQuery, useSyncCampaignLocationsMutation } from '../hooks/use-campaign-targeting';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import { SelectField } from '@/shared/ui/select-field';

interface Props {
  campaign: Campaign;
  onClose: () => void;
}

interface Row {
  location_id: string;
  priority: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
}

const toLocalDatetime = (value?: string | null) => (value ? value.slice(0, 16) : '');

export function CampaignTargetingModal({ campaign, onClose }: Props) {
  const { data, isLoading } = useCampaignLocationsQuery(campaign.id);
  const { data: locations = [], isLoading: loadingLocations } = useOptionsQuery('locations');
  const syncMutation = useSyncCampaignLocationsMutation(campaign.id);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!data) return;
    setRows(data.locations.map((item) => ({
      location_id: item.key,
      priority: String(item.priority ?? 0),
      is_active: item.is_active,
      starts_at: toLocalDatetime(item.starts_at),
      ends_at: toLocalDatetime(item.ends_at),
    })));
  }, [data]);

  const addRow = () => setRows((prev) => [...prev, { location_id: '', priority: '0', is_active: true, starts_at: '', ends_at: '' }]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));
  const setRow = <K extends keyof Row>(index: number, key: K, value: Row[K]) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const onSave = () => {
    const payload = rows
      .filter((r) => r.location_id)
      .map((r) => ({
        location_id: r.location_id,
        priority: Number.isFinite(Number(r.priority)) ? Number(r.priority) : 0,
        is_active: r.is_active,
        starts_at: r.starts_at || undefined,
        ends_at: r.ends_at || undefined,
      }));

    syncMutation.mutate(payload, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl border border-slate-200 shadow-xl">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ciblage localisation</h2>
            <p className="text-xs text-slate-500 mt-0.5">{campaign.name}</p>
          </div>
          <button onClick={addRow} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">+ Ajouter</button>
        </div>

        <div className="p-5 space-y-3 max-h-[65vh] overflow-auto">
          {isLoading ? (
            <div className="text-sm text-slate-400">Chargement…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-slate-400">Aucune localisation ciblée.</div>
          ) : rows.map((row, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-slate-100 rounded-lg p-3">
              <div className="md:col-span-4">
                <label className="block text-xs text-slate-500 mb-1">Localisation</label>
                <SelectField
                  instanceId={`targeting-location-${index}`}
                  options={locations}
                  value={row.location_id}
                  onChange={(value) => setRow(index, 'location_id', value)}
                  placeholder="Sélectionner une localisation"
                  isLoading={loadingLocations}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Priorité</label>
                <input value={row.priority} onChange={(e) => setRow(index, 'priority', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Début</label>
                <input type="datetime-local" value={row.starts_at} onChange={(e) => setRow(index, 'starts_at', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Fin</label>
                <input type="datetime-local" value={row.ends_at} onChange={(e) => setRow(index, 'ends_at', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="md:col-span-1 flex items-center">
                <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" checked={row.is_active} onChange={(e) => setRow(index, 'is_active', e.target.checked)} /> Active
                </label>
              </div>
              <div className="md:col-span-1 text-right">
                <button onClick={() => removeRow(index)} className="text-xs text-red-500 hover:text-red-700">Retirer</button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Annuler</button>
          <button
            onClick={onSave}
            disabled={syncMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {syncMutation.isPending ? 'Enregistrement…' : 'Enregistrer le ciblage'}
          </button>
        </div>
      </div>
    </div>
  );
}
