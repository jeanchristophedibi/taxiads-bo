'use client';

import { useState } from 'react';
import type { Screen, ScreenStatus } from '../../domain/entities/screen';
import { useUpdateScreenMutation } from '../hooks/use-screen-mutations';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import { SelectField } from '@/shared/ui/select-field';
import { useToast } from '@/shared/ui/toast-provider';

const STATUS_OPTIONS = [
  { key: 'online',        value: 'En ligne' },
  { key: 'offline',       value: 'Hors ligne' },
  { key: 'restarting',    value: 'Redémarrage' },
  { key: 'uninitialized', value: 'Non initialisé' },
];

interface Props {
  screen: Screen;
  onClose: () => void;
}

export function ScreenEditModal({ screen, onClose }: Props) {
  const toast = useToast();
  const updateMutation = useUpdateScreenMutation();
  const { data: playlists = [], isLoading: loadingPlaylists } = useOptionsQuery('playlists');

  const [form, setForm] = useState({
    name: screen.name,
    status: screen.status as string,
    playlist_key: screen.playlist?.key ?? '',
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      {
        id: screen.id,
        data: {
          name: form.name,
          status: form.status as ScreenStatus,
          playlist_key: form.playlist_key || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Écran mis à jour');
          onClose();
        },
        onError: (err) => {
          toast.error('Échec de la mise à jour', (err as Error).message);
        },
      },
    );
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-sheet w-full max-w-md">
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Modifier l&apos;écran</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--apple-label)' }}>{screen.slug}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
              <input
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Statut</label>
              <SelectField
                instanceId="screen-edit-status"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(v) => set('status', v)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Playlist</label>
              <SelectField
                instanceId="screen-edit-playlist"
                options={playlists}
                value={form.playlist_key}
                onChange={(v) => set('playlist_key', v)}
                isLoading={loadingPlaylists}
                placeholder="Aucune playlist"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
              {updateMutation.isPending ? (
                <>
                  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Enregistrement…
                </>
              ) : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
