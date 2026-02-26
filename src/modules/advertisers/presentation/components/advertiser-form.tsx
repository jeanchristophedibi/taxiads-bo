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
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">{advertiser ? 'Modifier l\'annonceur' : 'Nouvel annonceur'}</h2>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="block text-sm text-slate-500">Nom</label>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm text-slate-500">Email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => set('contact_email', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm text-slate-500">Téléphone</label>
              <input
                value={form.contact_phone}
                onChange={(e) => set('contact_phone', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending || !form.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending ? 'Enregistrement…' : advertiser ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
