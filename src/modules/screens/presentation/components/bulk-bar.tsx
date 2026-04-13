'use client';

import { useState } from 'react';
import {
  useBulkRefreshMutation,
  useBulkRestartMutation,
  useBulkAssignPlaylistMutation,
  useBulkUnassignPlaylistMutation,
  useBulkDeleteMutation,
  useBulkEmergencyMutation,
} from '../hooks/use-screen-mutations';
import { useToast } from '@/shared/ui/toast-provider';
import { useConfirm } from '@/shared/ui/confirm-dialog';
import { AssignPlaylistModal } from './assign-playlist-modal';
import { useAuthPermissions } from '@/shared/application/use-auth-permissions';

export function BulkBar({
  selectedKeys, onClear,
}: {
  selectedKeys: string[];
  onClear: () => void;
}) {
  const { can } = useAuthPermissions();
  const toast = useToast();
  const confirm = useConfirm();
  const n = selectedKeys.length;
  const bulkRefresh    = useBulkRefreshMutation();
  const bulkRestart    = useBulkRestartMutation();
  const bulkAssign     = useBulkAssignPlaylistMutation();
  const bulkUnassign   = useBulkUnassignPlaylistMutation();
  const bulkDelete     = useBulkDeleteMutation();
  const bulkEmergency  = useBulkEmergencyMutation();
  const [assignModal, setAssignModal] = useState(false);

  const act = (label: string, mutate: () => Promise<unknown>) =>
    mutate().then((res: unknown) => {
      const r = res as { ok?: boolean; error?: { message: string } } | null;
      if (r && r.ok === false) toast.error(label, r.error?.message);
      else { toast.success(label); onClear(); }
    });

  const isPending = bulkRefresh.isPending || bulkRestart.isPending || bulkAssign.isPending ||
    bulkUnassign.isPending || bulkDelete.isPending || bulkEmergency.isPending;

  const canRefresh = can('screens.bulk_refresh');
  const canRestart = can('screens.bulk_restart');
  const canAssign = can('screens.assign_playlist');
  const canEmergency = can('screens.emergency');
  const canDelete = can('screens.delete');
  const hasActions = canRefresh || canRestart || canAssign || canEmergency || canDelete;
  if (!hasActions) return null;

  return (
    <>
      <div
        className="flex items-center gap-3 px-4 py-2.5 text-sm animate-slide-up"
        style={{ background: 'var(--apple-blue)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <span className="text-white font-medium shrink-0">{n} sélectionné{n > 1 ? 's' : ''}</span>
        <div className="flex items-center gap-2 flex-wrap">
          {canRefresh && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => act('Actualisation envoyée', () => bulkRefresh.mutateAsync(selectedKeys))}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-white/15 text-white hover:bg-white/25 transition-colors disabled:opacity-40"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
              Actualiser
            </button>
          )}
          {canRestart && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => act('Redémarrage envoyé', () => bulkRestart.mutateAsync(selectedKeys))}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-white/15 text-white hover:bg-white/25 transition-colors disabled:opacity-40"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
              Redémarrer
            </button>
          )}
          {canAssign && (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setAssignModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-white/15 text-white hover:bg-white/25 transition-colors disabled:opacity-40"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h12M3 18h12M16 16l5-4-5-4v8z" /></svg>
                Playlist
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => act('Diffusion arrêtée', () => bulkUnassign.mutateAsync(selectedKeys))}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-white/15 text-white hover:bg-white/25 transition-colors disabled:opacity-40"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="14" x="3" y="5" /><rect width="5" height="14" x="16" y="5" /></svg>
                Éteindre
              </button>
            </>
          )}
          {canEmergency && (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={() => act('Alerte incendie envoyée', () => bulkEmergency.mutateAsync({ keys: selectedKeys, type: 'fire' }))}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-red-500/80 text-white hover:bg-red-500 transition-colors disabled:opacity-40"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                Incendie
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => act('Fin d\'alerte', () => bulkEmergency.mutateAsync({ keys: selectedKeys, type: 'lifted' }))}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-white/15 text-white hover:bg-white/25 transition-colors disabled:opacity-40"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                Fin alerte
              </button>
            </>
          )}
          {canDelete && (
            <button
              type="button"
              disabled={isPending}
              onClick={async () => {
                if (!await confirm({ title: `Supprimer ${n} écran${n > 1 ? 's' : ''} ?`, confirmLabel: 'Supprimer', danger: true })) return;
                act('Écrans supprimés', () => bulkDelete.mutateAsync(selectedKeys));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-apple bg-red-600/80 text-white hover:bg-red-600 transition-colors disabled:opacity-40"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
              Supprimer
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-white/60 hover:text-white transition-colors"
          title="Désélectionner tout"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {assignModal && canAssign && (
        <AssignPlaylistModal
          title={`Playlist pour ${n} écran${n > 1 ? 's' : ''}`}
          onClose={() => setAssignModal(false)}
          isPending={bulkAssign.isPending}
          onConfirm={(playlistKey) => {
            bulkAssign.mutate({ keys: selectedKeys, playlistKey }, {
              onSuccess: (res) => {
                if (res && !res.ok) toast.error('Playlist', (res.error as { message: string })?.message);
                else { toast.success('Playlist assignée'); setAssignModal(false); onClear(); }
              },
              onError: (err) => toast.error('Playlist', (err as Error).message),
            });
          }}
        />
      )}

    </>
  );
}
