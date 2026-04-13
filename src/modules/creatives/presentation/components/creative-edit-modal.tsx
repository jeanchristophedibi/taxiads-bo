'use client';

import { useRef, useState } from 'react';
import type { Creative } from '../../domain/entities/creative';
import { useUpdateCreativeMutation } from '../hooks/use-creative-mutations';
import { useToast } from '@/shared/ui/toast-provider';
import { SelectField } from '@/shared/ui/select-field';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import { Spinner } from '@/shared/ui/spinner';

const ORIENTATION_OPTIONS = [
  { value: '', label: 'Non définie' },
  { value: 'landscape', label: 'Paysage (16:9)' },
  { value: 'portrait', label: 'Portrait (9:16)' },
  { value: 'square', label: 'Carré (1:1)' },
];

const ACCEPTED = 'video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp,image/gif';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function fileIcon(file: File) {
  return file.type.startsWith('video/') ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#9333ea"><polygon points="5 3 19 12 5 21 5 3" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

interface Props {
  creative: Creative;
  onClose: () => void;
}

export function CreativeEditModal({ creative, onClose }: Props) {
  const toast = useToast();
  const update = useUpdateCreativeMutation();
  const { data: campaigns = [], isLoading: loadingCampaigns } = useOptionsQuery('campaigns');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: creative.name,
    duration: creative.duration != null ? String(creative.duration) : '',
    orientation: creative.orientation ?? '',
    campaign_id: creative.campaign?.key ?? '',
    is_active: creative.isActive,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (f: File) => {
    setNewFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const currentFileName = creative.mediaPath?.split('/').pop() ?? null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      {
        id: creative.id,
        data: {
          name: form.name,
          media: newFile ?? undefined,
          duration: form.duration !== '' ? Number(form.duration) : null,
          orientation: form.orientation || null,
          campaign_id: form.campaign_id || null,
          is_active: form.is_active,
        },
      },
      {
        onSuccess: (res) => {
          if (res && !res.ok) toast.error('Modification', (res.error as { message: string })?.message);
          else { toast.success('Créative mise à jour'); onClose(); }
        },
        onError: (err) => toast.error('Modification', (err as Error).message),
      },
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-sheet w-full max-w-md">
        <div className="modal-header">
          <h2 className="text-base font-semibold text-gray-900">Modifier la créative</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">

            {/* ── Fichier média ────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fichier média</label>

              {/* Fichier actuel */}
              {!newFile && currentFileName && (
                <div className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-apple bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 truncate flex-1" title={currentFileName}>{currentFileName}</p>
                  <span className="text-[10px] text-slate-400 shrink-0">Actuel</span>
                </div>
              )}

              {/* Zone de drop pour remplacer */}
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`relative rounded-apple border-2 border-dashed transition-colors cursor-pointer ${dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED}
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />

                {newFile ? (
                  <div className="flex items-center gap-3 px-4 py-3">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="" className="w-12 h-9 object-cover rounded-[6px] shrink-0 border border-slate-200" />
                    ) : (
                      <div className="w-12 h-9 rounded-[6px] bg-purple-50 flex items-center justify-center shrink-0">
                        {fileIcon(newFile)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{newFile.name}</p>
                      <p className="text-xs text-slate-400">{formatBytes(newFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setNewFile(null); setPreview(null); }}
                      className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="text-xs text-slate-400">{currentFileName ? 'Cliquer pour remplacer le fichier' : 'Glisser ou cliquer pour ajouter un fichier'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Nom ──────────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom</label>
              <input
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="input"
                placeholder="Nom de la créative"
              />
            </div>

            {/* ── Campagne ─────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Campagne</label>
              <SelectField
                instanceId="creative-edit-campaign"
                options={campaigns}
                value={form.campaign_id}
                onChange={(v) => set('campaign_id', v)}
                placeholder="Sélectionner une campagne"
                isLoading={loadingCampaigns}
              />
            </div>

            {/* ── Orientation + Durée ───────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Orientation</label>
                <select value={form.orientation} onChange={(e) => set('orientation', e.target.value)} className="input">
                  {ORIENTATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Durée (secondes)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={form.duration}
                  onChange={(e) => set('duration', e.target.value)}
                  className="input"
                  placeholder="ex. 15"
                />
              </div>
            </div>

            {/* ── Toggle actif ──────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => set('is_active', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
              </label>
              <span className="text-sm text-slate-700">Créative active</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={update.isPending} className="btn-primary">
              {update.isPending ? <Spinner size="sm" color="white" /> : null}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
