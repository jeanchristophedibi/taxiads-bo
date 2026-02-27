'use client';

import { useState } from 'react';
import { Spinner } from '@/shared/ui/spinner';
import type { Announcement } from '../../domain/entities/announcement';
import { useCreateAnnouncementMutation, useUpdateAnnouncementMutation } from '../hooks/use-announcement-mutations';
import { useToast } from '@/shared/ui/toast-provider';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const pad2 = (value: number) => String(value).padStart(2, '0');

const toInputValue = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 16);

  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Keep local wall-clock time from <input type="datetime-local"> (no UTC conversion).
const toApiDateTime = (local: string) => {
  if (!local) return '';
  return local.includes(':') && local.length === 16
    ? `${local.replace('T', ' ')}:00`
    : local.replace('T', ' ');
};

/* ─── Create modal ────────────────────────────────────────────────────────── */
export function AnnouncementCreateModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const mutation = useCreateAnnouncementMutation();
  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt]     = useState('');

  const canSave = title.trim().length > 0 && content.trim().length > 0 && startsAt && endsAt;

  const onSave = () => {
    if (!canSave) return;
    mutation.mutate(
      { title: title.trim(), content: content.trim(), starts_at: toApiDateTime(startsAt), ends_at: toApiDateTime(endsAt) },
      {
        onSuccess: () => { toast.success('Annonce créée'); onClose(); },
        onError: (err) => toast.error('Création échouée', (err as Error).message),
      },
    );
  };

  return <AnnouncementModal
    title="Nouvelle annonce"
    values={{ title, content, startsAt, endsAt }}
    onChange={{ setTitle, setContent, setStartsAt, setEndsAt }}
    isPending={mutation.isPending}
    isError={mutation.isError}
    canSave={!!canSave}
    onSave={onSave}
    onClose={onClose}
    submitLabel="Créer"
  />;
}

/* ─── Edit modal ──────────────────────────────────────────────────────────── */
export function AnnouncementEditModal({ announcement, onClose }: { announcement: Announcement; onClose: () => void }) {
  const toast = useToast();
  const mutation = useUpdateAnnouncementMutation();
  const [title, setTitle]       = useState(announcement.title);
  const [content, setContent]   = useState(announcement.content);
  const [startsAt, setStartsAt] = useState(toInputValue(announcement.startsAt));
  const [endsAt, setEndsAt]     = useState(toInputValue(announcement.endsAt));

  const canSave = title.trim().length > 0 && content.trim().length > 0 && startsAt && endsAt;

  const onSave = () => {
    if (!canSave) return;
    mutation.mutate(
      {
        id: announcement.id,
        data: {
          title: title.trim(),
          content: content.trim(),
          starts_at: toApiDateTime(startsAt),
          ends_at: toApiDateTime(endsAt),
        },
      },
      {
        onSuccess: () => { toast.success('Annonce modifiée'); onClose(); },
        onError: (err) => toast.error('Modification échouée', (err as Error).message),
      },
    );
  };

  return <AnnouncementModal
    title="Modifier l'annonce"
    subtitle={announcement.title}
    values={{ title, content, startsAt, endsAt }}
    onChange={{ setTitle, setContent, setStartsAt, setEndsAt }}
    isPending={mutation.isPending}
    isError={mutation.isError}
    canSave={!!canSave}
    onSave={onSave}
    onClose={onClose}
    submitLabel="Enregistrer"
  />;
}

/* ─── Shared modal shell ──────────────────────────────────────────────────── */
interface ModalProps {
  title: string;
  subtitle?: string;
  values: { title: string; content: string; startsAt: string; endsAt: string };
  onChange: {
    setTitle: (v: string) => void;
    setContent: (v: string) => void;
    setStartsAt: (v: string) => void;
    setEndsAt: (v: string) => void;
  };
  isPending: boolean;
  isError: boolean;
  canSave: boolean;
  onSave: () => void;
  onClose: () => void;
  submitLabel: string;
}

function AnnouncementModal({ title, subtitle, values, onChange, isPending, isError, canSave, onSave, onClose, submitLabel }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <div className="modal-body space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Titre <span className="text-red-500">*</span></label>
              <input value={values.title} onChange={(e) => onChange.setTitle(e.target.value)} className="input" placeholder="Info trafic" autoFocus />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contenu <span className="text-red-500">*</span></label>
              <textarea
                value={values.content}
                onChange={(e) => onChange.setContent(e.target.value)}
                className="input resize-none"
                rows={3}
                placeholder="Ralentissement secteur centre-ville."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Début <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  value={values.startsAt}
                  onChange={(e) => onChange.setStartsAt(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fin <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  value={values.endsAt}
                  min={values.startsAt}
                  onChange={(e) => onChange.setEndsAt(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {isError && (
              <p className="text-xs text-red-500">Une erreur est survenue. Vérifiez les dates et réessayez.</p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={isPending || !canSave} className="btn-primary">
              {isPending ? <Spinner size="sm" color="white" /> : null}
              {isPending ? 'Enregistrement…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
