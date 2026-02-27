'use client';

import { useState } from 'react';
import type { ScreenGroup } from '../../domain/entities/screen-group';
import { useCreateScreenGroupMutation, useUpdateScreenGroupMutation } from '../hooks/use-screen-group-mutations';
import { useToast } from '@/shared/ui/toast-provider';

interface Props {
  group?: ScreenGroup;
  onClose: () => void;
}

export function ScreenGroupFormModal({ group, onClose }: Props) {
  const toast = useToast();
  const isEdit = !!group;

  const [name, setName] = useState(group?.name ?? '');
  const [timezone, setTimezone] = useState(group?.settings?.timezone ?? '');

  const createMutation = useCreateScreenGroupMutation();
  const updateMutation = useUpdateScreenGroupMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: name.trim(),
      settings: timezone ? { timezone } : {},
    };
    if (isEdit) {
      updateMutation.mutate({ id: group.id, data }, {
        onSuccess: () => { toast.success('Groupe modifié'); onClose(); },
        onError: (err) => toast.error('Modification échouée', (err as Error).message),
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { toast.success('Groupe créé'); onClose(); },
        onError: (err) => toast.error('Création échouée', (err as Error).message),
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div className="modal-sheet w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Modifier le groupe' : 'Nouveau groupe'}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Zone Abidjan"
                className="input"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fuseau horaire</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Ex: Africa/Abidjan"
                className="input"
              />
              <p className="text-xs text-slate-400 mt-1">Format IANA, ex: Africa/Abidjan, Europe/Paris</p>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isPending}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={isPending || !name.trim()}>
              {isPending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
