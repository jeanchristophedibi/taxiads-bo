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
    type: playlist?.type ?? 'user',
    internal_name: playlist?.internalName ?? '',
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
      type: form.type || undefined,
      internal_name: form.internal_name || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            {playlist ? 'Modifier la playlist' : 'Nouvelle playlist'}
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
              <input
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                placeholder="user"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nom interne</label>
              <input
                value={form.internal_name}
                onChange={(e) => set('internal_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Projet</label>
            <SelectField
              options={projects}
              value={form.project_id}
              onChange={(v) => set('project_id', v)}
              isLoading={loadingProjects}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Campagne</label>
            <SelectField
              options={campaigns}
              value={form.campaign_id}
              onChange={(v) => set('campaign_id', v)}
              isLoading={loadingCampaigns}
            />
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
              {isPending ? 'Enregistrement…' : playlist ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
