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
    <div className="modal-overlay">
      <div className="modal-sheet w-full max-w-lg">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {campaign ? 'Modifier la campagne' : 'Nouvelle campagne'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {campaign ? `ID : ${campaign.id}` : 'Remplissez les informations ci-dessous'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
            <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nom de la campagne <span className="text-red-500">*</span>
              </label>
              <input required value={form.name} onChange={(e) => set('name', e.target.value)}
                placeholder="Ex. Campagne Ramadan 2025" className="input" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Statut</label>
                <SelectField instanceId="campaign-status" options={STATUS_OPTIONS} value={form.status} onChange={(v) => set('status', v)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Annonceur</label>
                <SelectField instanceId="campaign-advertiser" options={advertisers} value={form.advertiser_id} onChange={(v) => set('advertiser_id', v)} isLoading={loadingAdvertisers} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Budget (XOF)</label>
                <input type="number" min="0" value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder="0" className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Objectif</label>
                <input value={form.objective} onChange={(e) => set('objective', e.target.value)} placeholder="Ex. Notoriété" className="input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date de début</label>
                <input type="datetime-local" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date de fin</label>
                <input type="datetime-local" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} className="input" />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Enregistrement…
                </>
              ) : campaign ? 'Mettre à jour' : 'Créer la campagne'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
