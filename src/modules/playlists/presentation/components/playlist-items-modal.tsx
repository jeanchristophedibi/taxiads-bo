'use client';

import { useMemo, useRef, useState } from 'react';
import { SelectField } from '@/shared/ui/select-field';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import { Spinner } from '@/shared/ui/spinner';
import {
  useCreatePlaylistItemMutation,
  useDeletePlaylistItemMutation,
  usePlaylistItemsQuery,
  useUpdatePlaylistItemMutation,
} from '../hooks/use-playlist-items';
import type { PlaylistItemEntity } from '../../infrastructure/repositories/http-playlist-repository';

interface Props {
  playlist: { id: string; name: string };
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
  page_id: '', layout_id: '', creative_id: '', title: '',
  duration: '10', sort: '0', is_active: true, starts_at: '', ends_at: '',
});

const toLocalDatetime = (value?: string | null) => (value ? value.slice(0, 16) : '');

const getContentUrl = (content: Record<string, unknown> | null): string | null => {
  if (!content) return null;
  if (typeof content.url === 'string') return content.url;
  if (typeof content.path === 'string') return content.path;
  if (typeof content.media_url === 'string') return content.media_url;
  return null;
};

const isVideo = (file: File) => file.type.startsWith('video/');
const isImage = (file: File) => file.type.startsWith('image/');

export function PlaylistItemsModal({ playlist, onClose }: Props) {
  const { data, isLoading } = usePlaylistItemsQuery(playlist.id);
  const { data: pages = [], isLoading: loadingPages } = useOptionsQuery('pages');
  const { data: layouts = [], isLoading: loadingLayouts } = useOptionsQuery('layouts');
  const { data: creatives = [], isLoading: loadingCreatives } = useOptionsQuery('creatives');

  const createMutation = useCreatePlaylistItemMutation(playlist.id);
  const updateMutation = useUpdatePlaylistItemMutation(playlist.id);
  const deleteMutation = useDeletePlaylistItemMutation(playlist.id);

  const [form, setForm] = useState<FormState>(emptyForm());
  const [newFile, setNewFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const items = data?.items ?? [];

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const editItem = (item: PlaylistItemEntity) => {
    setNewFile(null);
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

  const clearForm = () => {
    setForm(emptyForm());
    setNewFile(null);
  };

  const handleFileDrop = (file: File) => setNewFile(file);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileDrop(file);
  };

  const payload = useMemo(() => ({
    page_id: form.page_id,
    layout_id: form.layout_id,
    creative_id: form.creative_id || undefined,
    media: newFile ?? undefined,
    title: form.title || undefined,
    duration: Number(form.duration || 10),
    sort: Number(form.sort || 0),
    is_active: form.is_active,
    starts_at: form.starts_at || undefined,
    ends_at: form.ends_at || undefined,
  }), [form, newFile]);

  const onSave = () => {
    if (!form.page_id || !form.layout_id) return;
    if (form.id) {
      updateMutation.mutate({ itemId: form.id, data: payload }, { onSuccess: clearForm });
    } else {
      createMutation.mutate(payload, { onSuccess: clearForm });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-sheet w-full max-w-5xl">
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Items de la playlist</h2>
            <p className="text-xs text-slate-500 mt-0.5">{playlist.name}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ borderBottom: '0.5px solid var(--apple-separator)' }}>

          {/* ── Items list ───────────────────────────────────────────────── */}
          <div className="modal-body max-h-[60vh] overflow-y-auto space-y-2" style={{ borderRight: '0.5px solid var(--apple-separator)' }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              {items.length} item{items.length > 1 ? 's' : ''}
            </p>
            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner size="md" /></div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-400">Aucun item dans cette playlist.</p>
                <p className="text-xs text-slate-300 mt-1">Ajoutez votre premier item via le formulaire.</p>
              </div>
            ) : (
              items.map((item) => {
                const contentUrl = getContentUrl(item.content);
                return (
                  <div key={item.id} className={`rounded-apple border p-3 transition-colors ${form.id === item.id ? 'border-blue-300 bg-blue-50/40' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className="flex items-start gap-2.5">
                      {/* Media thumbnail */}
                      {contentUrl ? (
                        <div className="shrink-0 w-14 h-10 rounded-md overflow-hidden bg-[#0d0f14]">
                          <img
                            src={contentUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      ) : (
                        <div className="shrink-0 w-14 h-10 rounded-md bg-slate-100 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="2.18" /><path d="m10 8 6 4-6 4V8z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.title || item.creative?.value || 'Item sans titre'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.page?.value ?? '—'} · {item.layout?.value ?? '—'} · {item.duration}s
                          {item.sort != null && ` · #${item.sort}`}
                        </p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button type="button" onClick={() => editItem(item)} className="text-xs font-medium" style={{ color: 'var(--apple-blue)' }}>
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                        className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-40"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Item form ────────────────────────────────────────────────── */}
          <div className="modal-body max-h-[60vh] overflow-y-auto space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              {form.id ? 'Modifier item' : 'Nouvel item'}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Page <span className="text-red-500">*</span></label>
              <SelectField instanceId="pli-page" options={pages} value={form.page_id} onChange={(v) => set('page_id', v)} isLoading={loadingPages} placeholder="Sélectionner une page" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Layout <span className="text-red-500">*</span></label>
              <SelectField instanceId="pli-layout" options={layouts} value={form.layout_id} onChange={(v) => set('layout_id', v)} isLoading={loadingLayouts} placeholder="Sélectionner un layout" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Créative</label>
              <SelectField instanceId="pli-creative" options={creatives} value={form.creative_id} onChange={(v) => set('creative_id', v)} isLoading={loadingCreatives} placeholder="Sélectionner une créative" />
            </div>

            {/* ── Media upload ─────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Média</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileDrop(f); }}
              />
              {newFile ? (
                <div className="rounded-apple border border-slate-200 overflow-hidden">
                  {isImage(newFile) ? (
                    <img
                      src={URL.createObjectURL(newFile)}
                      alt={newFile.name}
                      className="w-full max-h-32 object-cover"
                    />
                  ) : isVideo(newFile) ? (
                    <video
                      src={URL.createObjectURL(newFile)}
                      className="w-full max-h-32 object-cover"
                      muted
                    />
                  ) : null}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100">
                    <span className="text-xs text-slate-600 truncate max-w-[200px]">{newFile.name}</span>
                    <button
                      type="button"
                      onClick={() => { setNewFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="ml-2 text-slate-400 hover:text-slate-600 shrink-0"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-1.5 h-20 rounded-apple border-2 border-dashed cursor-pointer transition-colors ${dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="text-xs text-slate-400">Glisser ou <span className="text-blue-500">cliquer</span> pour ajouter un média</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Titre</label>
                <input value={form.title} onChange={(e) => set('title', e.target.value)} className="input" placeholder="Facultatif" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Durée (s)</label>
                <input type="number" min="1" max="3600" value={form.duration} onChange={(e) => set('duration', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ordre</label>
                <input type="number" min="0" value={form.sort} onChange={(e) => set('sort', e.target.value)} className="input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Début</label>
                <input type="datetime-local" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fin</label>
                <input type="datetime-local" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} className="input" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
              </label>
              <span className="text-sm text-slate-700">Item actif</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {form.id && (
                <button type="button" onClick={clearForm} className="btn-secondary text-xs">Nouveau</button>
              )}
              <button type="button" onClick={onSave} disabled={isSaving || !form.page_id || !form.layout_id} className="btn-primary">
                {isSaving ? <Spinner size="sm" color="white" /> : null}
                {isSaving ? 'Enregistrement…' : form.id ? 'Mettre à jour' : 'Créer item'}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary ml-auto">Fermer</button>
        </div>
      </div>
    </div>
  );
}
