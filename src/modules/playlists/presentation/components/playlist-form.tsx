'use client';

import { useState } from 'react';
import type { Playlist } from '../../domain/entities/playlist';
import type { CreatePlaylistInput, UpdatePlaylistInput } from '../../infrastructure/repositories/http-playlist-repository';
import { useCreatePlaylistMutation, useUpdatePlaylistMutation } from '../hooks/use-playlist-mutations';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import { SelectField } from '@/shared/ui/select-field';
import { useToast } from '@/shared/ui/toast-provider';

interface Props {
  playlist?: Playlist;
  onClose: () => void;
}

export function PlaylistForm({ playlist, onClose }: Props) {
  const createMutation = useCreatePlaylistMutation();
  const updateMutation = useUpdatePlaylistMutation();
  const { data: projects = [], isLoading: loadingProjects } = useOptionsQuery('projects');
  const { data: campaigns = [], isLoading: loadingCampaigns } = useOptionsQuery('campaigns');
  const toast = useToast();

  const [form, setForm] = useState({
    name: playlist?.name ?? '',
    project_id: playlist?.project?.key ?? '',
    campaign_id: playlist?.campaign?.key ?? '',
  });

  const [error, setError] = useState<string | null>(null);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: CreatePlaylistInput | UpdatePlaylistInput = {
      name: form.name,
      project_id: form.project_id || undefined,
      campaign_id: form.campaign_id || undefined,
    };

    if (playlist) {
      updateMutation.mutate({ id: playlist.id, data: payload }, {
        onSuccess: () => {
          toast.success('Playlist mise à jour');
          onClose();
        },
        onError: (err) => {
          const message = (err as Error).message;
          setError(message);
          toast.error('Échec de la mise à jour', message);
        },
      });
    } else {
      createMutation.mutate(payload as CreatePlaylistInput, {
        onSuccess: () => {
          toast.success('Playlist créée');
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
      <div className="modal-sheet w-full max-w-md">
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {playlist ? 'Modifier la playlist' : 'Nouvelle playlist'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {playlist ? `ID : ${playlist.id}` : 'Remplissez les informations ci-dessous'}
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
                Nom <span className="text-red-500">*</span>
              </label>
              <input required value={form.name} onChange={(e) => set('name', e.target.value)}
                placeholder="Ex. Playlist Matin" className="input" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Projet</label>
              <SelectField instanceId="playlist-project" options={projects} value={form.project_id} onChange={(v) => set('project_id', v)} isLoading={loadingProjects} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Campagne</label>
              <SelectField instanceId="playlist-campaign" options={campaigns} value={form.campaign_id} onChange={(v) => set('campaign_id', v)} isLoading={loadingCampaigns} />
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
              ) : playlist ? 'Mettre à jour' : 'Créer la playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
