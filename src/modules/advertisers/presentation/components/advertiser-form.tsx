'use client';

import { useState } from 'react';
import type { Advertiser } from '../../domain/entities/advertiser';
import { useCreateAdvertiserMutation, useUpdateAdvertiserMutation } from '../hooks/use-advertiser-mutations';

interface Props {
  advertiser?: Advertiser;
  onClose: () => void;
}

export function AdvertiserForm({ advertiser, onClose }: Props) {
  const [form, setForm] = useState({
    name: advertiser?.name ?? '',
    contact_email: advertiser?.contactEmail ?? '',
    contact_phone: advertiser?.contactPhone ?? '',
  });

  const createMutation = useCreateAdvertiserMutation();
  const updateMutation = useUpdateAdvertiserMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const set = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      contact_email: form.contact_email.trim() || undefined,
      contact_phone: form.contact_phone.trim() || undefined,
    };

    if (advertiser) {
      updateMutation.mutate({ id: advertiser.id, data: payload }, { onSuccess: onClose });
      return;
    }

    createMutation.mutate(payload, { onSuccess: onClose });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-sheet w-full max-w-xl">
        <div className="modal-header">
          <h2 className="text-base font-semibold text-gray-900">{advertiser ? 'Modifier l\'annonceur' : 'Nouvel annonceur'}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit}>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => set('contact_email', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Téléphone</label>
                <input
                  value={form.contact_phone}
                  onChange={(e) => set('contact_phone', e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button
              type="submit"
              disabled={isPending || !form.name.trim()}
              className="btn-primary"
            >
              {isPending ? 'Enregistrement…' : advertiser ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
