'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import type { Creative } from '../../domain/entities/creative';
import { useToggleCreativeMutation, useDeleteCreativeMutation } from '../hooks/use-creative-mutations';
import { CreativeEditModal } from './creative-edit-modal';
import { useToast } from '@/shared/ui/toast-provider';
import { useConfirm } from '@/shared/ui/confirm-dialog';
import { useAuthPermissions } from '@/shared/application/use-auth-permissions';

export function CreativeActionsMenu({ creative }: { creative: Creative }) {
  const { can } = useAuthPermissions();
  const toast = useToast();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [dropPos, setDropPos] = useState<{ top?: number; bottom?: number; right: number; maxHeight?: number }>({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const toggle = useToggleCreativeMutation();
  const del    = useDeleteCreativeMutation();

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

  const handleToggle = () => {
    close();
    toggle.mutate(
      { id: creative.id, isActive: !creative.isActive },
      {
        onSuccess: (res) => {
          if (res && !res.ok) toast.error('Statut', (res.error as { message: string })?.message);
          else toast.success(creative.isActive ? 'Créative désactivée' : 'Créative activée');
        },
        onError: (err) => toast.error('Statut', (err as Error).message),
      },
    );
  };

  const handleDelete = async () => {
    close();
    if (!await confirm({ title: `Supprimer "${creative.name}" ?`, confirmLabel: 'Supprimer', danger: true })) return;
    del.mutate(creative.id, {
      onSuccess: (res) => {
        if (res && !res.ok) toast.error('Suppression', (res.error as { message: string })?.message);
        else toast.success('Créative supprimée');
      },
      onError: (err) => toast.error('Suppression', (err as Error).message),
    });
  };

  const canWrite = can('creatives.write');
  const canDelete = can('creatives.delete');
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
          style={{ position: 'fixed', top: dropPos.top, bottom: dropPos.bottom, right: dropPos.right, zIndex: 9999, minWidth: 180, maxHeight: dropPos.maxHeight, overflowY: dropPos.maxHeight ? 'auto' : undefined, borderColor: 'var(--apple-separator)' }}
          className="bg-white rounded-apple-lg border py-1 shadow-apple-lg"
        >
          {canWrite && (
            <>
              <button
                type="button"
                onClick={() => { close(); setEditOpen(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Modifier
              </button>
              <button
                type="button"
                onClick={handleToggle}
                disabled={toggle.isPending}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 text-left disabled:opacity-40"
              >
                {creative.isActive ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="14" x="3" y="5" /><rect width="5" height="14" x="16" y="5" /></svg>
                    Désactiver
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Activer
                  </>
                )}
              </button>
            </>
          )}
          {canDelete && (
            <>
              <div className="my-1 border-t" style={{ borderColor: 'var(--apple-separator)' }} />
              <button
                type="button"
                onClick={handleDelete}
                disabled={del.isPending}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 text-left disabled:opacity-40"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
                Supprimer
              </button>
            </>
          )}
        </div>,
        document.body,
      )}

      {editOpen && canWrite && <CreativeEditModal creative={creative} onClose={() => setEditOpen(false)} />}
    </>
  );
}
