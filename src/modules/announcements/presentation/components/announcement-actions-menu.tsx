'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import type { Announcement } from '../../domain/entities/announcement';
import { useDeleteAnnouncementMutation, useToggleAnnouncementMutation } from '../hooks/use-announcement-mutations';
import { AnnouncementEditModal } from './announcement-form-modal';
import { useToast } from '@/shared/ui/toast-provider';
import { useConfirm } from '@/shared/ui/confirm-dialog';
import { useAuthPermissions } from '@/shared/application/use-auth-permissions';

export function AnnouncementActionsMenu({ announcement }: { announcement: Announcement }) {
  const { can } = useAuthPermissions();
  const toast = useToast();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [dropPos, setDropPos] = useState<{ top?: number; bottom?: number; right: number; maxHeight?: number }>({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const deleteMutation = useDeleteAnnouncementMutation();
  const toggleMutation = useToggleAnnouncementMutation();

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
      if (spaceBelow >= 160 || spaceBelow >= spaceAbove) {
        setDropPos({ top: rect.bottom + 4, right, maxHeight: Math.min(280, spaceBelow) });
      } else {
        setDropPos({ bottom: window.innerHeight - rect.top + 4, right, maxHeight: Math.min(280, spaceAbove) });
      }
    }
    setOpen(true);
  };

  const close = () => setOpen(false);

  const handleToggle = () => {
    close();
    const activate = !announcement.isActiveNow;
    toggleMutation.mutate({ id: announcement.id, activate }, {
      onSuccess: () => toast.success(activate ? 'Annonce activée' : 'Annonce désactivée'),
      onError: (err) => toast.error('Erreur', (err as Error).message),
    });
  };

  const handleDelete = async () => {
    close();
    if (!await confirm({ title: `Supprimer "${announcement.title}" ?`, message: 'Cette action est irréversible.', confirmLabel: 'Supprimer', danger: true })) return;
    deleteMutation.mutate(announcement.id, {
      onSuccess: () => toast.success('Annonce supprimée'),
      onError: (err) => toast.error('Suppression échouée', (err as Error).message),
    });
  };

  const canWrite = can('announcements.write');
  const canDelete = can('announcements.delete');
  if (!canWrite && !canDelete) return null;

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
          {/* Toggle activer/désactiver */}
          {canWrite && (
            <button
              type="button"
              onClick={handleToggle}
              disabled={toggleMutation.isPending}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left disabled:opacity-40 ${announcement.isActiveNow ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
            >
              {announcement.isActiveNow ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Désactiver
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Activer
                </>
              )}
            </button>
          )}

          <div style={{ height: 1, backgroundColor: 'var(--apple-separator)', margin: '2px 0' }} />

          {canWrite && (
            <button type="button" onClick={() => { close(); setEditOpen(true); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Modifier
            </button>
          )}

          {canDelete && (
            <>
              <div style={{ height: 1, backgroundColor: 'var(--apple-separator)', margin: '2px 0' }} />
              <button type="button" onClick={handleDelete} disabled={deleteMutation.isPending}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 text-left disabled:opacity-40">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                </svg>
                Supprimer
              </button>
            </>
          )}
        </div>,
        document.body,
      )}

      {editOpen && canWrite && <AnnouncementEditModal announcement={announcement} onClose={() => setEditOpen(false)} />}
    </>
  );
}
