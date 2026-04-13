'use client';

import { useState } from 'react';
import type { Artwork } from '../../domain/entities/artwork';
import { useArtworksQuery } from '../hooks/use-artworks-query';
import type { ListArtworksQuery } from '../../infrastructure/repositories/http-artwork-repository';
import { ArtworkActionsMenu } from './artwork-actions-menu';
import { ArtworkViewModal } from './artwork-view-modal';

interface Props {
  query: ListArtworksQuery;
  page: number;
  onPageChange: (page: number) => void;
}

const FORMAT_CHIPS = [
  { key: 'horizontal' as const, label: 'H', color: 'bg-blue-100 text-blue-700' },
  { key: 'vertical'   as const, label: 'V', color: 'bg-violet-100 text-violet-700' },
  { key: 'banner'     as const, label: 'B', color: 'bg-orange-100 text-orange-700' },
];

function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const [viewOpen, setViewOpen] = useState(false);
  const previewBase = artwork.urls.horizontal;
  const previewWebp = artwork.urls.horizontal_webp || null;

  return (
    <>
    <div className="card group overflow-hidden p-0 flex flex-col">
      {/* Preview — clickable */}
      <button
        type="button"
        onClick={() => setViewOpen(true)}
        className="relative aspect-video bg-[#0d0f14] overflow-hidden w-full text-left"
      >
        {previewBase ? (
          <picture className="w-full h-full">
            {previewWebp && <source srcSet={previewWebp} type="image/webp" />}
            <img
              src={previewBase}
              alt={artwork.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </picture>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </div>

        {/* Format chips */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {FORMAT_CHIPS.map(({ key, label, color }) =>
            artwork.urls[key] ? (
              <span
                key={key}
                className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${color} backdrop-blur-sm`}
              >
                {label}
              </span>
            ) : null
          )}
        </div>
      </button>

      {/* Body */}
      <div className="p-3 flex-1 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{artwork.name}</p>
          {artwork.artist && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{artwork.artist}</p>
          )}
        </div>
        <ArtworkActionsMenu artwork={artwork} />
      </div>
    </div>

    {viewOpen && <ArtworkViewModal artwork={artwork} onClose={() => setViewOpen(false)} />}
    </>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-0 overflow-hidden flex flex-col">
      <div className="skeleton aspect-video" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3.5 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function ArtworksGrid({ query, page, onPageChange }: Props) {
  const { data, isLoading, isError } = useArtworksQuery({ ...query, page });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
        </svg>
        <p className="text-sm text-red-500">Impossible de charger les artworks.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const artworks = data?.data ?? [];
  const meta = data?.meta;

  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <p className="text-sm text-slate-400">Aucun artwork trouvé.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {artworks.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.lastPage > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            {meta.total} artwork{meta.total > 1 ? 's' : ''} · page {meta.currentPage}/{meta.lastPage}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="btn-secondary disabled:opacity-40"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Précédent
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= meta.lastPage}
              className="btn-secondary disabled:opacity-40"
            >
              Suivant
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
