'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import type { Screen } from '../../domain/entities/screen';
import type { EmergencyType, CustomEmergencyPayload } from '../../domain/repositories/screen-repository';
import {
  useRefreshScreenMutation,
  useRestartScreenMutation,
  useAssignPlaylistMutation,
  useUnassignPlaylistMutation,
  useEmergencyMutation,
} from '../hooks/use-screen-mutations';
import { AssignPlaylistModal } from './assign-playlist-modal';
import { ScreenEditModal } from './screen-edit-modal';
import { ScreenLiveDetailsModal } from './screen-live-details-modal';
import { useToast } from '@/shared/ui/toast-provider';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type ModalKind = 'assign-playlist' | 'edit' | 'custom-emergency' | 'live-details' | null;

/* ─── Emergency labels ───────────────────────────────────────────────────── */
const EMERGENCY_ACTIONS: { type: EmergencyType; label: string; icon: React.ReactNode; danger?: boolean }[] = [
  {
    type: 'fire', label: 'Évacuation incendie', danger: true,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A5.5 5.5 0 0 0 17.5 14.5c0-4-2.5-5.5-3-8-1 1.5-1 3-3 4 0-3-2-5.5-3-7C7 6 6 9 6 11a6 6 0 0 0 2.5 3.5z" /></svg>,
  },
  {
    type: 'general', label: 'Évacuation générale', danger: true,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  },
  {
    type: 'custom', label: 'Alerte personnalisée…',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>,
  },
  {
    type: 'test', label: "Test d'urgence",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>,
  },
  {
    type: 'lifted', label: "Fin d'alerte",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  },
  {
    type: 'disable', label: 'Désactiver urgence',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M17.73 17.73A10.14 10.14 0 0 1 19 21H5a10.14 10.14 0 0 0 4-8V8" /><path d="M10.27 3.73A6 6 0 0 1 18 8" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  },
];

/* ─── Dropdown section ───────────────────────────────────────────────────── */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--apple-label)' }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function Item({
  label, icon, onClick, danger = false, disabled = false,
}: {
  label: string; icon?: React.ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors disabled:opacity-40 ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon && <span className="shrink-0 w-4 text-center">{icon}</span>}
      {label}
    </button>
  );
}

/* ─── Custom emergency form ──────────────────────────────────────────────── */
function CustomEmergencyModal({
  onConfirm, onClose, isPending,
}: {
  onConfirm: (p: CustomEmergencyPayload) => void;
  onClose: () => void;
  isPending?: boolean;
}) {
  const [form, setForm] = useState({ title: '', message: '', title_fr: '', message_fr: '' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-sheet w-full max-w-md">
        <div className="modal-header">
          <h2 className="text-base font-semibold text-gray-900">📢 Alerte personnalisée</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="modal-body space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Titre (EN)</label>
              <input required value={form.title} onChange={(e) => set('title', e.target.value)} className="input" placeholder="Emergency" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Titre (FR)</label>
              <input value={form.title_fr} onChange={(e) => set('title_fr', e.target.value)} className="input" placeholder="Urgence" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message (EN)</label>
            <textarea rows={2} value={form.message} onChange={(e) => set('message', e.target.value)} className="input resize-none" placeholder="Please evacuate now" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message (FR)</label>
            <textarea rows={2} value={form.message_fr} onChange={(e) => set('message_fr', e.target.value)} className="input resize-none" placeholder="Veuillez évacuer immédiatement" />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          <button
            type="button"
            disabled={!form.title || !form.message || isPending}
            onClick={() => onConfirm(form)}
            className="btn-danger"
          >
            {isPending ? 'Envoi…' : 'Déclencher'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function ScreenActionsMenu({ screen }: { screen: Screen }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [dropPos, setDropPos] = useState<{ top?: number; bottom?: number; right: number; maxHeight?: number }>({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const refresh     = useRefreshScreenMutation();
  const restart     = useRestartScreenMutation();
  const assignPl    = useAssignPlaylistMutation();
  const unassignPl  = useUnassignPlaylistMutation();
  const emergency   = useEmergencyMutation();

  /* Close on outside click */
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

  /* Open dropdown — flip upward if not enough space below */
  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const right = window.innerWidth - rect.right;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;

      if (spaceBelow >= 300 || spaceBelow >= spaceAbove) {
        setDropPos({ top: rect.bottom + 4, right, maxHeight: Math.min(440, spaceBelow) });
      } else {
        setDropPos({ bottom: window.innerHeight - rect.top + 4, right, maxHeight: Math.min(440, spaceAbove) });
      }
    }
    setOpen(true);
  };

  const close = () => setOpen(false);
  const openModal = (kind: ModalKind) => { close(); setModal(kind); };

  const handleAction = (label: string, mutate: () => Promise<unknown>) => {
    close();
    mutate().then((res) => {
      if (res && typeof res === 'object' && 'ok' in res && !res.ok && 'error' in res) {
        const failure = res as { error?: { message?: string } };
        toast.error(label, failure.error?.message);
      } else {
        toast.success(label);
      }
    });
  };

  const handleEmergency = (type: EmergencyType, payload?: CustomEmergencyPayload) => {
    if (type !== 'custom') setModal(null);
    emergency.mutate({ id: screen.id, type, payload }, {
      onSuccess: (res) => {
        if (res && !res.ok) toast.error('Urgence', (res.error as { message: string })?.message);
        else toast.success(`Urgence — ${EMERGENCY_ACTIONS.find((a) => a.type === type)?.label}`);
      },
      onError: (err) => toast.error('Urgence', (err as Error).message),
    });
  };

  return (
    <>
      {/* Kebab button */}
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

      {/* Dropdown portal */}
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropRef}
          style={{ position: 'fixed', top: dropPos.top, bottom: dropPos.bottom, right: dropPos.right, zIndex: 9999, minWidth: 220, maxHeight: dropPos.maxHeight, overflowY: dropPos.maxHeight ? 'auto' : undefined, borderColor: 'var(--apple-separator)' }}
          className="bg-white rounded-apple-lg border py-1 shadow-apple-lg"
        >
          <Section label="Contrôle">
            <Item label="Détails live" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="3" /></svg>
            } onClick={() => openModal('live-details')} />
            <Item label="Actualiser" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
            } onClick={() => handleAction('Actualisation envoyée', () => refresh.mutateAsync(screen.id))} disabled={refresh.isPending} />
            <Item label="Redémarrer" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
            } onClick={() => handleAction('Redémarrage envoyé', () => restart.mutateAsync(screen.id))} disabled={restart.isPending} />
          </Section>

          <div className="my-1 border-t" style={{ borderColor: 'var(--apple-separator)' }} />

          <Section label="Playlist">
            <Item label="Définir la playlist" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h12M3 18h12M16 16l5-4-5-4v8z" /></svg>
            } onClick={() => openModal('assign-playlist')} />
            <Item label="Éteindre la diffusion" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="14" x="3" y="5" /><rect width="5" height="14" x="16" y="5" /></svg>
            } onClick={() => handleAction('Diffusion arrêtée', () => unassignPl.mutateAsync(screen.id))} disabled={!screen.playlist || unassignPl.isPending} />
          </Section>

          <div className="my-1 border-t" style={{ borderColor: 'var(--apple-separator)' }} />

          <Section label="Urgence">
            {EMERGENCY_ACTIONS.map((a) => (
              <Item
                key={a.type}
                label={a.label}
                icon={a.icon}
                danger={a.danger}
                onClick={() => {
                  if (a.type === 'custom') { openModal('custom-emergency'); return; }
                  close();
                  handleEmergency(a.type);
                }}
                disabled={emergency.isPending}
              />
            ))}
          </Section>

          <div className="my-1 border-t" style={{ borderColor: 'var(--apple-separator)' }} />

          <Section label="Gestion">
            <Item label="Modifier" icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            } onClick={() => openModal('edit')} />
          </Section>
        </div>,
        document.body,
      )}

      {/* Modals */}
      {modal === 'assign-playlist' && (
        <AssignPlaylistModal
          onClose={() => setModal(null)}
          isPending={assignPl.isPending}
          onConfirm={(playlistKey) => {
            assignPl.mutate({ id: screen.id, playlistKey }, {
              onSuccess: (res) => {
                if (res && !res.ok) toast.error('Playlist', (res.error as { message: string })?.message);
                else { toast.success('Playlist assignée'); setModal(null); }
              },
              onError: (err) => toast.error('Playlist', (err as Error).message),
            });
          }}
        />
      )}

      {modal === 'edit' && (
        <ScreenEditModal screen={screen} onClose={() => setModal(null)} />
      )}

      {modal === 'custom-emergency' && (
        <CustomEmergencyModal
          onClose={() => setModal(null)}
          isPending={emergency.isPending}
          onConfirm={(payload) => handleEmergency('custom', payload)}
        />
      )}

      {modal === 'live-details' && (
        <ScreenLiveDetailsModal screen={screen} onClose={() => setModal(null)} />
      )}
    </>
  );
}
