'use client';

import { useState } from 'react';
import type { Campaign, CampaignStatus } from '../../domain/entities/campaign';
import type { CreateCampaignInput, UpdateCampaignInput } from '../../domain/repositories/campaign-repository';
import { useCreateCampaignMutation, useUpdateCampaignMutation } from '../hooks/use-campaign-mutations';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import { SelectField } from '@/shared/ui/select-field';
import { useToast } from '@/shared/ui/toast-provider';

const STATUSES: CampaignStatus[] = ['draft', 'scheduled', 'active', 'paused', 'completed', 'archived'];
const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Brouillon', scheduled: 'Planifié', active: 'Actif',
  paused: 'Pausé', completed: 'Terminé', archived: 'Archivé',
};

const STATUS_OPTIONS = STATUSES.map((s) => ({ key: s, value: STATUS_LABELS[s] }));

interface Props {
  campaign?: Campaign;
  onClose: () => void;
}

export function CampaignForm({ campaign, onClose }: Props) {
  const createMutation = useCreateCampaignMutation();
  const updateMutation = useUpdateCampaignMutation();
  const { data: advertisers = [], isLoading: loadingAdvertisers } = useOptionsQuery('advertisers');
  const toast = useToast();

  const [form, setForm] = useState({
    name: campaign?.name ?? '',
    status: (campaign?.status ?? 'draft') as CampaignStatus,
    objective: campaign?.objective ?? '',
    budget: campaign?.budget ?? '',
    starts_at: campaign?.startsAt ? campaign.startsAt.slice(0, 16) : '',
    ends_at: campaign?.endsAt ? campaign.endsAt.slice(0, 16) : '',
    advertiser_id: campaign?.advertiser?.key ?? '',
  });

  const [error, setError] = useState<string | null>(null);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: CreateCampaignInput | UpdateCampaignInput = {
      name: form.name,
      status: form.status,
      objective: form.objective || undefined,
      budget: form.budget ? parseFloat(form.budget) : undefined,
      starts_at: form.starts_at ? form.starts_at.replace('T', ' ') + ':00' : undefined,
      ends_at: form.ends_at ? form.ends_at.replace('T', ' ') + ':00' : undefined,
      advertiser_id: form.advertiser_id || undefined,
    };

    if (campaign) {
      updateMutation.mutate({ id: campaign.id, data: payload }, {
        onSuccess: () => {
          toast.success('Campagne mise à jour');
          onClose();
        },
        onError: (err) => {
          const message = (err as Error).message;
          setError(message);
          toast.error('Échec de la mise à jour', message);
        },
      });
    } else {
      createMutation.mutate(payload as CreateCampaignInput, {
        onSuccess: () => {
          toast.success('Campagne créée');
          onClose();
        },
        onError: (err) => {
          const message = (err as Error).message;
          setError(message);
          toast.error('Échec de création', message);
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            {campaign ? 'Modifier la campagne' : 'Nouvelle campagne'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nom *</label>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Statut</label>
              <SelectField
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(v) => set('status', v)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Annonceur</label>
              <SelectField
                options={advertisers}
                value={form.advertiser_id}
                onChange={(v) => set('advertiser_id', v)}
                isLoading={loadingAdvertisers}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Budget (XOF)</label>
              <input
                type="number"
                min="0"
                value={form.budget}
                onChange={(e) => set('budget', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Objectif</label>
              <input
                value={form.objective}
                onChange={(e) => set('objective', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Début</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => set('starts_at', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fin</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => set('ends_at', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {isPending ? 'Enregistrement…' : campaign ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
