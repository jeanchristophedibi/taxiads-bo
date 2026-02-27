'use client';

import { useRef, useState } from 'react';
import { Spinner } from '@/shared/ui/spinner';
import type { Artwork } from '../../domain/entities/artwork';
import { useUpdateArtworkMutation } from '../hooks/use-artwork-mutations';
import { useToast } from '@/shared/ui/toast-provider';

interface Props {
  artwork: Artwork;
  onClose: () => void;
}

type FormatKey = 'horizontal' | 'vertical' | 'banner';

const FORMAT_META: { key: FormatKey; label: string; hint: string }[] = [
  { key: 'horizontal', label: 'Horizontal', hint: '16:9 paysage' },
  { key: 'vertical',   label: 'Vertical',   hint: '9:16 portrait' },
  { key: 'banner',     label: 'Banner',      hint: 'Format bannière' },
];

interface FileZoneProps {
  label: string;
  hint: string;
  currentUrl: string;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}

function FileZone({ label, hint, currentUrl, file, onFile, onClear }: FileZoneProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const previewSrc = file ? URL.createObjectURL(file) : currentUrl;
  const isImage = file ? file.type.startsWith('image/') : Boolean(currentUrl);

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <p className="text-[11px] text-slate-400 mb-2">{hint}</p>
      <input ref={ref} type="file" accept="image/*,video/*" className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {previewSrc ? (
        <div className="rounded-apple border border-slate-200 overflow-hidden">
          {isImage ? (
            <img src={previewSrc} alt={label} className="w-full max-h-24 object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="h-14 flex items-center justify-center bg-slate-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 10 5 2.5L15 15V10z" /><rect x="2" y="7" width="13" height="10" rx="2" />
              </svg>
            </div>
          )}
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
              {file ? file.name : 'Fichier actuel'}
            </span>
            <button type="button"
              onClick={() => { ref.current?.click(); }}
              className="ml-1 text-[11px] font-medium shrink-0" style={{ color: 'var(--apple-blue)' }}>
              Remplacer
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

export function ArtworkEditModal({ artwork, onClose }: Props) {
  const toast = useToast();
  const mutation = useUpdateArtworkMutation();
  const [name, setName] = useState(artwork.name);
  const [artist, setArtist] = useState(artwork.artist ?? '');
  const [files, setFiles] = useState<Record<FormatKey, File | null>>({ horizontal: null, vertical: null, banner: null });

  const setFile = (key: FormatKey) => (f: File) => setFiles((prev) => ({ ...prev, [key]: f }));

  const canSave = name.trim().length > 0;

  const onSave = () => {
    if (!canSave) return;
    mutation.mutate(
      { id: artwork.id, data: { name: name.trim(), artist: artist.trim() || undefined, horizontal: files.horizontal ?? undefined, vertical: files.vertical ?? undefined, banner: files.banner ?? undefined } },
      {
        onSuccess: () => { toast.success('Artwork modifié'); onClose(); },
        onError: (err) => toast.error('Modification échouée', (err as Error).message),
      },
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-sheet w-full max-w-xl">
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Modifier l'artwork</h2>
            <p className="text-xs text-slate-500 mt-0.5">{artwork.name}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Artiste</label>
                <input value={artist} onChange={(e) => setArtist(e.target.value)} className="input" placeholder="Studio TaxiAds" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {FORMAT_META.map(({ key, label, hint }) => (
                <FileZone
                  key={key}
                  label={label}
                  hint={hint}
                  currentUrl={artwork.urls[key]}
                  file={files[key]}
                  onFile={setFile(key)}
                  onClear={() => setFiles((prev) => ({ ...prev, [key]: null }))}
                />
              ))}
            </div>

            {mutation.isError && (
              <p className="text-xs text-red-500">Une erreur est survenue. Veuillez réessayer.</p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={mutation.isPending || !canSave} className="btn-primary">
              {mutation.isPending ? <Spinner size="sm" color="white" /> : null}
              {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
