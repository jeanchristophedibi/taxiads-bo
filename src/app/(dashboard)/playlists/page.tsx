'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PlaylistsTable } from '@/modules/playlists/presentation/components/playlists-table';
import { PlaylistForm } from '@/modules/playlists/presentation/components/playlist-form';
import { PlaylistItemsModal } from '@/modules/playlists/presentation/components/playlist-items-modal';
import type { Playlist } from '@/modules/playlists/domain/entities/playlist';

export default function PlaylistsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get('search') ?? '';
  const initialPage = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);

  const [modal, setModal] = useState<{ open: boolean; playlist?: Playlist }>({ open: false });
  const [itemsModal, setItemsModal] = useState<{ open: boolean; playlist?: Playlist }>({ open: false });

  const updateUrl = useMemo(() => {
    return (next: { search?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.search !== undefined) {
        if (next.search.trim()) params.set('search', next.search.trim());
        else params.delete('search');
      }
      if (next.page !== undefined) {
        if (next.page > 1) params.set('page', String(next.page));
        else params.delete('page');
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    };
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
      updateUrl({ search: searchInput, page: 1 });
    }, 350);
    return () => window.clearTimeout(handle);
  }, [searchInput, updateUrl]);

  const onPageChange = (nextPage: number) => {
    setPage(nextPage);
    updateUrl({ page: nextPage });
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Playlists</h1>
          <p className="text-sm text-slate-500 mt-0.5">Organisez vos contenus publicitaires en playlists</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouvelle playlist
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="toolbar">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une playlist…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input pl-9"
            />
          </div>
        </div>

        <PlaylistsTable
          search={search || undefined}
          page={page}
          onPageChange={onPageChange}
          onEdit={(p) => setModal({ open: true, playlist: p })}
          onItems={(p) => setItemsModal({ open: true, playlist: p })}
        />
      </div>

      {modal.open && (
        <PlaylistForm playlist={modal.playlist} onClose={() => setModal({ open: false })} />
      )}
      {itemsModal.open && itemsModal.playlist && (
        <PlaylistItemsModal playlist={itemsModal.playlist} onClose={() => setItemsModal({ open: false })} />
      )}
    </div>
  );
}
