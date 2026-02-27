'use client';

import { useArtworksQuery } from '../hooks/use-artworks-query';
import type { ListArtworksQuery } from '../../infrastructure/repositories/http-artwork-repository';
import { ArtworkActionsMenu } from './artwork-actions-menu';

interface Props {
  query: ListArtworksQuery;
  page: number;
  onPageChange: (page: number) => void;
}

const FORMAT_CHIPS = [
  { key: 'horizontal' as const, label: 'H', color: 'bg-blue-50 text-blue-700' },
  { key: 'vertical'   as const, label: 'V', color: 'bg-violet-50 text-violet-700' },
  { key: 'banner'     as const, label: 'B', color: 'bg-orange-50 text-orange-700' },
];

export function ArtworksTable({ query, page, onPageChange }: Props) {
  const { data, isLoading, isError } = useArtworksQuery({ ...query, page });

  if (isError) {
    return (
      <div className="card flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-red-500">Impossible de charger les artworks.</p>
      </div>
    );
  }

  const artworks = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto"><table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th className="text-left pl-4 pr-2 py-3 w-12" />
            <th className="text-left px-3 py-3">Artwork</th>
            <th className="text-left px-3 py-3">Artiste</th>
            <th className="text-left px-3 py-3">Formats</th>
            <th className="text-left px-3 py-3">Créé le</th>
            <th className="px-3 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="tbl-body">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="pl-4 pr-2 py-3"><div className="skeleton w-10 h-7 rounded" /></td>
                  <td className="px-3 py-3"><div className="skeleton h-3.5 w-40 rounded" /></td>
                  <td className="px-3 py-3"><div className="skeleton h-3 w-28 rounded" /></td>
                  <td className="px-3 py-3"><div className="skeleton h-5 w-20 rounded" /></td>
                  <td className="px-3 py-3"><div className="skeleton h-3 w-20 rounded" /></td>
                  <td className="px-3 py-3" />
                </tr>
              ))
            : artworks.length === 0
            ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-sm text-slate-400">
                    Aucun artwork trouvé.
                  </td>
                </tr>
              )
            : artworks.map((artwork) => {
                const previewBase = artwork.urls.horizontal;
                const previewWebp = artwork.urls.horizontal_webp || null;
                return (
                  <tr key={artwork.id}>
                    {/* Thumbnail */}
                    <td className="pl-4 pr-2 py-2.5">
                      <div className="w-10 h-7 rounded-md overflow-hidden bg-[#0d0f14] shrink-0">
                        {previewBase ? (
                          <picture className="w-full h-full">
                            {previewWebp && <source srcSet={previewWebp} type="image/webp" />}
                            <img src={previewBase} alt={artwork.name} className="w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                          </picture>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-medium text-slate-900">{artwork.name}</p>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-500">{artwork.artist ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        {FORMAT_CHIPS.map(({ key, label, color }) =>
                          artwork.urls[key] ? (
                            <span key={key} className={`badge ${color} text-[10px] font-bold px-1.5 py-0.5`}>{label}</span>
                          ) : null
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-400">
                      {new Date(artwork.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-3 py-2.5">
                      <ArtworkActionsMenu artwork={artwork} />
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table></div>

      {/* Pagination */}
      {meta && meta.lastPage > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {meta.total} artwork{meta.total > 1 ? 's' : ''} · page {meta.currentPage}/{meta.lastPage}
          </p>
          <div className="flex gap-1">
            <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="btn-secondary disabled:opacity-40">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              Précédent
            </button>
            <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= meta.lastPage} className="btn-secondary disabled:opacity-40">
              Suivant
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
