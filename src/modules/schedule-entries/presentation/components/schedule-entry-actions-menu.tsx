'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import type { ScheduleEntry } from '../../domain/entities/schedule-entry';
import { useDeleteScheduleEntryMutation } from '../hooks/use-schedule-entry-mutations';
import { ScheduleEntryFormModal } from './schedule-entry-form-modal';
import { useToast } from '@/shared/ui/toast-provider';
import { useConfirm } from '@/shared/ui/confirm-dialog';
import { useAuthPermissions } from '@/shared/application/use-auth-permissions';

export function ScheduleEntryActionsMenu({ scheduleEntry }: { scheduleEntry: ScheduleEntry }) {
  const { can } = useAuthPermissions();
  const toast = useToast();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [dropPos, setDropPos] = useState<{ top?: number; bottom?: number; right: number }>({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const deleteMutation = useDeleteScheduleEntryMutation();

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
      if (spaceBelow >= 120) {
        setDropPos({ top: rect.bottom + 4, right });
      } else {
        setDropPos({ bottom: window.innerHeight - rect.top + 4, right });
      }
    }
    setOpen(true);
  };

  const close = () => setOpen(false);

  const handleDelete = async () => {
    close();
    const ok = await confirm({
      title: `Supprimer "${scheduleEntry.title}" ?`,
      message: 'Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!ok) return;

    deleteMutation.mutate(scheduleEntry.id, {
      onSuccess: () => toast.success('Programme supprimé'),
      onError: (err) => toast.error('Suppression échouée', (err as Error).message),
    });
  };

  const canWrite = can('schedule.write');
  const canDelete = can('schedule.delete');
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
          style={{ position: 'fixed', top: dropPos.top, bottom: dropPos.bottom, right: dropPos.right, zIndex: 9999, minWidth: 160, borderColor: 'var(--apple-separator)' }}
          className="bg-white rounded-apple-lg border py-1 shadow-apple-lg"
        >
          {canWrite && (
            <button
              type="button"
              onClick={() => { close(); setEditOpen(true); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Modifier
            </button>
          )}

          {canDelete && (
            <>
              <div style={{ height: 1, backgroundColor: 'var(--apple-separator)', margin: '2px 0' }} />

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 text-left disabled:opacity-40"
              >
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

      {editOpen && canWrite && <ScheduleEntryFormModal scheduleEntry={scheduleEntry} onClose={() => setEditOpen(false)} />}
    </>
  );
}
