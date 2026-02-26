'use client';

import { useState } from 'react';
import type { Location } from '../../domain/entities/location';
import { useCreateLocationMutation, useUpdateLocationMutation } from '../hooks/use-location-mutations';

interface Props {
  location?: Location;
  onClose: () => void;
}

export function LocationForm({ location, onClose }: Props) {
  const [form, setForm] = useState({
    name: location?.name ?? '',
    city: location?.city ?? '',
    country: location?.country ?? '',
    type: location?.type ?? '',
    latitude: location?.latitude?.toString() ?? '',
    longitude: location?.longitude?.toString() ?? '',
    radius_m: location?.radiusM?.toString() ?? '',
    is_active: location?.isActive ?? true,
  });

  const createMutation = useCreateLocationMutation();
  const updateMutation = useUpdateLocationMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      city: form.city.trim() || undefined,
      country: form.country.trim() || undefined,
      type: form.type.trim() || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      radius_m: form.radius_m ? Number(form.radius_m) : undefined,
      is_active: form.is_active,
    };

    if (location) {
      updateMutation.mutate({ id: location.id, data: payload }, { onSuccess: onClose });
      return;
    }

    createMutation.mutate(payload, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-xl">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">{location ? 'Modifier la localisation' : 'Nouvelle localisation'}</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm text-slate-500">Ville</label>
              <input value={form.city} onChange={(e) => set('city', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm text-slate-500">Pays</label>
              <input value={form.country} onChange={(e) => set('country', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm text-slate-500">Type</label>
              <input value={form.type} onChange={(e) => set('type', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm text-slate-500">Latitude</label>
              <input value={form.latitude} onChange={(e) => set('latitude', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm text-slate-500">Longitude</label>
              <input value={form.longitude} onChange={(e) => set('longitude', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm text-slate-500">Rayon (m)</label>
              <input value={form.radius_m} onChange={(e) => set('radius_m', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
            Localisation active
          </label>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isPending || !form.name.trim()} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {isPending ? 'Enregistrement…' : location ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
