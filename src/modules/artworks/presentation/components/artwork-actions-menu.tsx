'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import type { Artwork } from '../../domain/entities/artwork';
import { ArtworkEditModal } from './artwork-edit-modal';
import { ArtworkViewModal } from './artwork-view-modal';
import { useDeleteArtworkMutation } from '../hooks/use-artwork-mutations';
import { useToast } from '@/shared/ui/toast-provider';
import { useConfirm } from '@/shared/ui/confirm-dialog';

export function ArtworkActionsMenu({ artwork }: { artwork: Artwork }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [dropPos, setDropPos] = useState<{ top?: number; bottom?: number; right: number; maxHeight?: number }>({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const deleteMutation = useDeleteArtworkMutation();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) setOpen(false);
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
      if (spaceBelow >= 140 || spaceBelow >= spaceAbove) {
        setDropPos({ top: rect.bottom + 4, right, maxHeight: Math.min(240, spaceBelow) });
      } else {
        setDropPos({ bottom: window.innerHeight - rect.top + 4, right, maxHeight: Math.min(240, spaceAbove) });
      }
    }
    setOpen(true);
  };

  const close = () => setOpen(false);

  const handleDelete = async () => {
    close();
    if (!await confirm({ title: `Supprimer "${artwork.name}" ?`, message: 'Cette action est irréversible.', confirmLabel: 'Supprimer', danger: true })) return;
    deleteMutation.mutate(artwork.id, {
      onSuccess: () => toast.success('Artwork supprimé'),
      onError: (err) => toast.error('Suppression échouée', (err as Error).message),
    });
  };

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
          style={{ position: 'fixed', top: dropPos.top, bottom: dropPos.bottom, right: dropPos.right, zIndex: 9999, minWidth: 170, maxHeight: dropPos.maxHeight, overflowY: dropPos.maxHeight ? 'auto' : undefined, borderColor: 'var(--apple-separator)' }}
          className="bg-white rounded-apple-lg border py-1 shadow-apple-lg"
        >
          <button type="button" onClick={() => { close(); setViewOpen(true); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Voir
          </button>
          <button type="button" onClick={() => { close(); setEditOpen(true); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </button>
          <div style={{ height: 1, backgroundColor: 'var(--apple-separator)', margin: '2px 0' }} />
          <button type="button" onClick={handleDelete}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 text-left">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
            Supprimer
          </button>
        </div>,
        document.body,
      )}

      {viewOpen && <ArtworkViewModal artwork={artwork} onClose={() => setViewOpen(false)} />}
      {editOpen && <ArtworkEditModal artwork={artwork} onClose={() => setEditOpen(false)} />}
    </>
  );
}
