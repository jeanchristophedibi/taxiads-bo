'use client';

import { useMemo, useState } from 'react';
import type { Playlist } from '../../domain/entities/playlist';
import { SelectField } from '@/shared/ui/select-field';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import {
  useCreatePlaylistItemMutation,
  useDeletePlaylistItemMutation,
  usePlaylistItemsQuery,
  useUpdatePlaylistItemMutation,
} from '../hooks/use-playlist-items';
import type { PlaylistItemEntity } from '../../infrastructure/repositories/http-playlist-repository';

interface Props {
  playlist: Playlist;
  onClose: () => void;
}

interface FormState {
  id?: string;
  page_id: string;
  layout_id: string;
  creative_id: string;
  title: string;
  duration: string;
  sort: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
}

const emptyForm = (): FormState => ({
  page_id: '',
  layout_id: '',
  creative_id: '',
  title: '',
  duration: '10',
  sort: '0',
  is_active: true,
  starts_at: '',
  ends_at: '',
});

const toLocalDatetime = (value?: string | null) => (value ? value.slice(0, 16) : '');

export function PlaylistItemsModal({ playlist, onClose }: Props) {
  const { data, isLoading } = usePlaylistItemsQuery(playlist.id);
  const { data: pages = [], isLoading: loadingPages } = useOptionsQuery('pages');
  const { data: layouts = [], isLoading: loadingLayouts } = useOptionsQuery('layouts');
  const { data: creatives = [], isLoading: loadingCreatives } = useOptionsQuery('creatives');

  const createMutation = useCreatePlaylistItemMutation(playlist.id);
  const updateMutation = useUpdatePlaylistItemMutation(playlist.id);
  const deleteMutation = useDeletePlaylistItemMutation(playlist.id);

  const [form, setForm] = useState<FormState>(emptyForm());

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const items = data?.items ?? [];

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const editItem = (item: PlaylistItemEntity) => {
    setForm({
      id: item.id,
      page_id: item.page?.key ?? '',
      layout_id: item.layout?.key ?? '',
      creative_id: item.creative?.key ?? '',
      title: item.title ?? '',
      duration: String(item.duration ?? 10),
      sort: String(item.sort ?? 0),
      is_active: item.is_active,
      starts_at: toLocalDatetime(item.starts_at),
      ends_at: toLocalDatetime(item.ends_at),
    });
  };

  const clearForm = () => setForm(emptyForm());

  const payload = useMemo(() => ({
    page_id: form.page_id,
    layout_id: form.layout_id,
    creative_id: form.creative_id || undefined,
    title: form.title || undefined,
    duration: Number(form.duration || 10),
    sort: Number(form.sort || 0),
    is_active: form.is_active,
    starts_at: form.starts_at || undefined,
    ends_at: form.ends_at || undefined,
  }), [form]);

  const onSave = () => {
    if (!form.page_id || !form.layout_id) return;

    if (form.id) {
      updateMutation.mutate({ itemId: form.id, data: payload }, { onSuccess: clearForm });
      return;
    }

    createMutation.mutate(payload, { onSuccess: clearForm });
  };

  const onDelete = (itemId: string) => deleteMutation.mutate(itemId);

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl bg-white rounded-xl border border-slate-200 shadow-xl">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Items playlist</h2>
          <p className="text-xs text-slate-500 mt-0.5">{playlist.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="border-r border-slate-100 p-5 max-h-[65vh] overflow-auto">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Liste des items</h3>
            {isLoading ? (
              <div className="text-sm text-slate-400">Chargement…</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-slate-400">Aucun item.</div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="border border-slate-100 rounded-lg p-3">
                    <div className="text-sm font-medium text-slate-900">{item.title || item.creative?.value || 'Item sans titre'}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Page: {item.page?.value || '—'} · Layout: {item.layout?.value || '—'} · Durée: {item.duration}s
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => editItem(item)} className="text-xs text-blue-600 hover:text-blue-800">Modifier</button>
                      <button onClick={() => onDelete(item.id)} className="inline-flex items-center rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 max-h-[65vh] overflow-auto">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">{form.id ? 'Modifier item' : 'Nouvel item'}</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Page</label>
                <SelectField options={pages} value={form.page_id} onChange={(v) => set('page_id', v)} isLoading={loadingPages} placeholder="Sélectionner une page" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Layout</label>
                <SelectField options={layouts} value={form.layout_id} onChange={(v) => set('layout_id', v)} isLoading={loadingLayouts} placeholder="Sélectionner un layout" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Créative (optionnel)</label>
                <SelectField options={creatives} value={form.creative_id} onChange={(v) => set('creative_id', v)} isLoading={loadingCreatives} placeholder="Sélectionner une créative" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Titre</label>
                  <input value={form.title} onChange={(e) => set('title', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Durée (s)</label>
                  <input value={form.duration} onChange={(e) => set('duration', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Sort</label>
                  <input value={form.sort} onChange={(e) => set('sort', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Début</label>
                  <input type="datetime-local" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Fin</label>
                  <input type="datetime-local" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} /> Item actif
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                {form.id && (
                  <button onClick={clearForm} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700">Nouveau</button>
                )}
                <button
                  onClick={onSave}
                  disabled={isSaving || !form.page_id || !form.layout_id}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSaving ? 'Enregistrement…' : form.id ? 'Mettre à jour' : 'Créer item'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Fermer</button>
        </div>
      </div>
    </div>
  );
}
