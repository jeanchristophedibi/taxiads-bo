'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import type { Playlist } from '../../domain/entities/playlist';
import { PlaylistForm } from './playlist-form';
import { PlaylistItemsModal } from './playlist-items-modal';
import { PlaylistAssignModal } from './playlist-assign-modal';

export function PlaylistActionsMenu({ playlist }: { playlist: Playlist }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [dropPos, setDropPos] = useState<{ top?: number; bottom?: number; right: number; maxHeight?: number }>({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const right = window.innerWidth - rect.right;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      if (spaceBelow >= 200 || spaceBelow >= spaceAbove) {
        setDropPos({ top: rect.bottom + 4, right, maxHeight: Math.min(320, spaceBelow) });
      } else {
        setDropPos({ bottom: window.innerHeight - rect.top + 4, right, maxHeight: Math.min(320, spaceAbove) });
      }
    }
    setOpen(true);
  };

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="w-7 h-7 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="Actions"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropRef}
          style={{ position: 'fixed', top: dropPos.top, bottom: dropPos.bottom, right: dropPos.right, zIndex: 9999, minWidth: 190, maxHeight: dropPos.maxHeight, overflowY: dropPos.maxHeight ? 'auto' : undefined, borderColor: 'var(--apple-separator)' }}
          className="bg-white rounded-apple-lg border py-1 shadow-apple-lg"
        >
          {/* Modifier */}
          <button type="button" onClick={() => { close(); setEditOpen(true); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </button>

          {/* Items */}
          <button type="button" onClick={() => { close(); setItemsOpen(true); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M3 12h12M3 18h12M16 16l5-4-5-4v8z" />
            </svg>
            Gérer les items
          </button>

          {/* Assigner */}
          <button type="button" onClick={() => { close(); setAssignOpen(true); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" />
            </svg>
            Assigner aux écrans
          </button>
        </div>,
        document.body,
      )}

      {editOpen && <PlaylistForm playlist={playlist} onClose={() => setEditOpen(false)} />}
      {itemsOpen && <PlaylistItemsModal playlist={playlist} onClose={() => setItemsOpen(false)} />}
      {assignOpen && <PlaylistAssignModal playlist={playlist} onClose={() => setAssignOpen(false)} />}
    </>
  );
}
