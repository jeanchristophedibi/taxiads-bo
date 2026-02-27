'use client';

import { useState } from 'react';
import type { Artwork } from '../../domain/entities/artwork';

interface Props {
  artwork: Artwork;
  onClose: () => void;
}

type FormatTab = 'horizontal' | 'vertical' | 'banner';

const TABS: { key: FormatTab; label: string; aspect: string }[] = [
  { key: 'horizontal', label: 'Horizontal', aspect: 'aspect-video' },
  { key: 'vertical',   label: 'Vertical',   aspect: 'aspect-[9/16]' },
  { key: 'banner',     label: 'Bannière',   aspect: 'aspect-[4/1]' },
];

export function ArtworkViewModal({ artwork, onClose }: Props) {
  const availableTabs = TABS.filter((t) => artwork.urls[t.key]);
  const [active, setActive] = useState<FormatTab>(availableTabs[0]?.key ?? 'horizontal');

  const activeTab = TABS.find((t) => t.key === active)!;
  const baseUrl  = artwork.urls[active];
  const webpUrl  = artwork.urls[`${active}_webp` as keyof typeof artwork.urls] || null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-sheet w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{artwork.name}</h2>
            {artwork.artist && <p className="text-xs text-slate-500 mt-0.5">{artwork.artist}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body space-y-4">
          {/* Format tabs */}
          {availableTabs.length > 1 && (
            <div className="flex gap-1 p-0.5 bg-slate-100 rounded-apple w-fit">
              {availableTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActive(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors ${
                    active === tab.key
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Preview */}
          <div className={`${activeTab.aspect} w-full bg-[#0d0f14] rounded-apple overflow-hidden flex items-center justify-center`}
            style={{ maxHeight: '60vh' }}>
            {baseUrl ? (
              <picture className="w-full h-full">
                {webpUrl && <source srcSet={webpUrl} type="image/webp" />}
                <img
                  key={active}
                  src={baseUrl}
                  alt={`${artwork.name} — ${activeTab.label}`}
                  className="w-full h-full object-contain"
                />
              </picture>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-600">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" />
                </svg>
                <span className="text-sm">Aucun fichier</span>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
            <span>Créé le {new Date(artwork.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>·</span>
            <div className="flex gap-1.5">
              {TABS.map(({ key, label }) => (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    artwork.urls[key]
                      ? key === 'horizontal' ? 'bg-blue-50 text-blue-700'
                      : key === 'vertical'   ? 'bg-violet-50 text-violet-700'
                      : 'bg-orange-50 text-orange-700'
                      : 'bg-slate-100 text-slate-400 line-through'
                  }`}
                >
                  {label[0]}
                </span>
              ))}
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
