'use client';

import { useRef, useState } from 'react';
import { useCreateCreativeMutation } from '../hooks/use-creative-mutations';
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#9333ea"><polygon points="5 3 19 12 5 21 5 3" /></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

interface Props {
  onClose: () => void;
}

export function CreativeCreateModal({ onClose }: Props) {
  const toast = useToast();
  const create = useCreateCreativeMutation();
  const { data: campaigns = [], isLoading: loadingCampaigns } = useOptionsQuery('campaigns');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    campaign_id: '',
    orientation: '',
    duration: '',
    is_active: true,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (f: File) => {
    setFile(f);
    if (!form.name) set('name', f.name.replace(/\.[^.]+$/, ''));
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    create.mutate(
      {
        name: form.name,
        media: file,
        campaign_id: form.campaign_id || undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        orientation: form.orientation || undefined,
        is_active: form.is_active,
      },
      {
        onSuccess: (res) => {
          if (res && !res.ok) toast.error('Création', (res.error as { message: string })?.message);
          else { toast.success('Créative ajoutée'); onClose(); }
        },
        onError: (err) => toast.error('Création', (err as Error).message),
      },
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-sheet w-full max-w-lg">
        <div className="modal-header">
          <h2 className="text-base font-semibold text-gray-900">Nouvelle créative</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">

            {/* ── Drop zone ───────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fichier média <span className="text-red-500">*</span></label>
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

                {file ? (
                  <div className="flex items-center gap-3 px-4 py-3">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="" className="w-14 h-10 object-cover rounded-[6px] shrink-0 border border-slate-200" />
                    ) : (
                      <div className="w-14 h-10 rounded-[6px] bg-purple-50 flex items-center justify-center shrink-0">
                        {fileIcon(file)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                      className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <div className="w-10 h-10 rounded-apple bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Glisser un fichier ici</p>
                    <p className="text-xs text-slate-400">ou cliquer pour parcourir · MP4, WebM, JPG, PNG, WebP</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Name ────────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
              <input
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="input"
                placeholder="Nom de la créative"
              />
            </div>

            {/* ── Campaign ────────────────────────────────────────────── */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Campagne</label>
              <SelectField
                instanceId="creative-create-campaign"
                options={campaigns}
                value={form.campaign_id}
                onChange={(v) => set('campaign_id', v)}
                placeholder="Sélectionner une campagne"
                isLoading={loadingCampaigns}
              />
            </div>

            {/* ── Orientation + Duration ──────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Orientation</label>
                <select value={form.orientation} onChange={(e) => set('orientation', e.target.value)} className="input">
                  {ORIENTATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Durée (secondes)</label>
                <input
                  type="number" min="1" max="300"
                  value={form.duration}
                  onChange={(e) => set('duration', e.target.value)}
                  className="input" placeholder="ex. 15"
                />
              </div>
            </div>

            {/* ── Active toggle ────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
              </label>
              <span className="text-sm text-slate-700">Activer immédiatement</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={!file || !form.name || create.isPending} className="btn-primary">
              {create.isPending ? <Spinner size="sm" color="white" /> : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
              {create.isPending ? 'Envoi…' : 'Importer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
