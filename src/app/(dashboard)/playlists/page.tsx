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

  const openCreate = () => setModal({ open: true, playlist: undefined });
  const openEdit = (playlist: Playlist) => setModal({ open: true, playlist });
  const closeModal = () => setModal({ open: false });

  const openItems = (playlist: Playlist) => setItemsModal({ open: true, playlist });
  const closeItems = () => setItemsModal({ open: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Playlists</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvelle playlist
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Rechercher…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <PlaylistsTable
          search={search || undefined}
          page={page}
          onPageChange={onPageChange}
          onEdit={openEdit}
          onItems={openItems}
        />
      </div>

      {modal.open && (
        <PlaylistForm playlist={modal.playlist} onClose={closeModal} />
      )}

      {itemsModal.open && itemsModal.playlist && (
        <PlaylistItemsModal playlist={itemsModal.playlist} onClose={closeItems} />
      )}
    </div>
  );
}
