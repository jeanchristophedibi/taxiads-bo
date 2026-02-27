'use client';

import { useRef, useState } from 'react';
import { Spinner } from '@/shared/ui/spinner';
import { useCreateArtworkMutation } from '../hooks/use-artwork-mutations';
import { useToast } from '@/shared/ui/toast-provider';

interface Props {
  onClose: () => void;
}

interface FileZoneProps {
  label: string;
  hint: string;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}

function FileZone({ label, hint, file, onFile, onClear }: FileZoneProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const isImage = file?.type.startsWith('image/');

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <p className="text-[11px] text-slate-400 mb-2">{hint}</p>
      <input ref={ref} type="file" accept="image/*,video/*" className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {file ? (
        <div className="rounded-apple border border-slate-200 overflow-hidden">
          {isImage ? (
            <img src={URL.createObjectURL(file)} alt={file.name} className="w-full max-h-28 object-cover" />
          ) : (
            <div className="h-16 flex items-center justify-center bg-slate-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 10 5 2.5L15 15V10z" /><rect x="2" y="7" width="13" height="10" rx="2" />
              </svg>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-t border-slate-100">
            <span className="text-xs text-slate-600 truncate max-w-[200px]">{file.name}</span>
            <button type="button" onClick={() => { onClear(); if (ref.current) ref.current.value = ''; }}
              className="ml-2 text-slate-400 hover:text-slate-600 shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button" tabIndex={0}
          onClick={() => ref.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
          className={`flex flex-col items-center justify-center gap-1 h-16 rounded-apple border-2 border-dashed cursor-pointer transition-colors ${dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-[11px] text-slate-400">Glisser ou <span className="text-blue-500">cliquer</span></span>
        </div>
      )}
    </div>
  );
}

export function ArtworkCreateModal({ onClose }: Props) {
  const toast = useToast();
  const mutation = useCreateArtworkMutation();
  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');
  const [horizontal, setHorizontal] = useState<File | null>(null);
  const [vertical, setVertical] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const canSave = name.trim().length > 0;

  const onSave = () => {
    if (!canSave) return;
    mutation.mutate(
      { name: name.trim(), artist: artist.trim() || undefined, horizontal: horizontal ?? undefined, vertical: vertical ?? undefined, banner: banner ?? undefined },
      {
        onSuccess: () => { toast.success('Artwork créé'); onClose(); },
        onError: (err) => toast.error('Création échouée', (err as Error).message),
      },
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-sheet w-full max-w-xl">
        <div className="modal-header">
          <h2 className="text-base font-semibold text-gray-900">Nouvel artwork</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Sunset Loop" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Artiste</label>
                <input value={artist} onChange={(e) => setArtist(e.target.value)} className="input" placeholder="Studio TaxiAds" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FileZone label="Horizontal" hint="16:9 paysage" file={horizontal} onFile={setHorizontal} onClear={() => setHorizontal(null)} />
              <FileZone label="Vertical" hint="9:16 portrait" file={vertical} onFile={setVertical} onClear={() => setVertical(null)} />
              <FileZone label="Banner" hint="Format bannière" file={banner} onFile={setBanner} onClear={() => setBanner(null)} />
            </div>

            {mutation.isError && (
              <p className="text-xs text-red-500">Une erreur est survenue. Veuillez réessayer.</p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={mutation.isPending || !canSave} className="btn-primary">
              {mutation.isPending ? <Spinner size="sm" color="white" /> : null}
              {mutation.isPending ? 'Enregistrement…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
