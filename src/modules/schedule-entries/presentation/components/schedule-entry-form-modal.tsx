'use client';

import { useMemo, useState } from 'react';
import type { ScheduleEntry } from '../../domain/entities/schedule-entry';
import { useCreateScheduleEntryMutation, useUpdateScheduleEntryMutation } from '../hooks/use-schedule-entry-mutations';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import { SelectField } from '@/shared/ui/select-field';
import { Spinner } from '@/shared/ui/spinner';
import { useToast } from '@/shared/ui/toast-provider';

const pad2 = (value: number) => String(value).padStart(2, '0');

const toInputValue = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 16);
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}T${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`;
};

const toApiDateTime = (local: string) => {
  if (!local) return '';
  const base = local.length === 16 ? local : local.slice(0, 16);
  return `${base}:00+00:00`;
};

interface Props {
  scheduleEntry?: ScheduleEntry;
  onClose: () => void;
}

export function ScheduleEntryFormModal({ scheduleEntry, onClose }: Props) {
  const isEdit = !!scheduleEntry;
  const toast = useToast();

  const createMutation = useCreateScheduleEntryMutation();
  const updateMutation = useUpdateScheduleEntryMutation();

  const { data: rooms = [], isLoading: loadingRooms } = useOptionsQuery('rooms');
  const { data: types = [], isLoading: loadingTypes } = useOptionsQuery('schedule-types');
  const { data: organizers = [], isLoading: loadingOrganizers } = useOptionsQuery('schedule-organizers');

  const [title, setTitle] = useState(scheduleEntry?.title ?? '');
  const [description, setDescription] = useState(scheduleEntry?.description ?? '');
  const [roomKey, setRoomKey] = useState(scheduleEntry?.room?.key ?? '');
  const [scheduleTypeKey, setScheduleTypeKey] = useState(scheduleEntry?.scheduleType?.key ?? '');
  const [scheduleOrganizerKey, setScheduleOrganizerKey] = useState(scheduleEntry?.scheduleOrganizer?.key ?? '');
  const [startsAt, setStartsAt] = useState(toInputValue(scheduleEntry?.startsAt));
  const [endsAt, setEndsAt] = useState(toInputValue(scheduleEntry?.endsAt));
  const [delay, setDelay] = useState(String(scheduleEntry?.delay ?? 0));
  const [message, setMessage] = useState(scheduleEntry?.message ?? '');
  const [automationText, setAutomationText] = useState(
    scheduleEntry?.automation ? JSON.stringify(scheduleEntry.automation, null, 2) : '',
  );
  const [flagMoved, setFlagMoved] = useState(scheduleEntry?.flags.includes('moved') ?? false);
  const [flagCancelled, setFlagCancelled] = useState(scheduleEntry?.flags.includes('cancelled') ?? false);
  const [flagAfterDark, setFlagAfterDark] = useState(scheduleEntry?.flags.includes('after_dark') ?? false);

  const [localError, setLocalError] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const flags = useMemo(() => {
    const list: string[] = [];
    if (flagMoved) list.push('moved');
    if (flagCancelled) list.push('cancelled');
    if (flagAfterDark) list.push('after_dark');
    return list;
  }, [flagMoved, flagCancelled, flagAfterDark]);

  const canSave = title.trim().length > 0 && roomKey && startsAt && endsAt;

  const onSave = () => {
    if (!canSave) return;
    setLocalError(null);

    let parsedAutomation: unknown;
    if (automationText.trim()) {
      try {
        parsedAutomation = JSON.parse(automationText);
      } catch {
        setLocalError('Le champ automation doit contenir un JSON valide.');
        return;
      }
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      room_key: roomKey,
      schedule_type_key: scheduleTypeKey || undefined,
      schedule_organizer_key: scheduleOrganizerKey || undefined,
      starts_at: toApiDateTime(startsAt),
      ends_at: toApiDateTime(endsAt),
      flags: flags.length ? flags : undefined,
      delay: delay.trim() ? Number(delay) : 0,
      message: message.trim() || undefined,
      automation: parsedAutomation,
    };

    if (Number.isNaN(payload.delay)) {
      setLocalError('Le champ délai doit être un nombre valide.');
      return;
    }

    if (isEdit && scheduleEntry) {
      updateMutation.mutate(
        { id: scheduleEntry.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Programme modifié');
            onClose();
          },
          onError: (err) => toast.error('Modification échouée', (err as Error).message),
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Programme créé');
        onClose();
      },
      onError: (err) => toast.error('Création échouée', (err as Error).message),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Modifier le programme' : 'Nouveau programme'}</h2>
            {isEdit && <p className="text-xs text-slate-500 mt-0.5">{scheduleEntry.title}</p>}
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <div className="modal-body space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Titre <span className="text-red-500">*</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Session matin" autoFocus />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-none" rows={2} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Salle <span className="text-red-500">*</span></label>
                <SelectField instanceId="schedule-room" options={rooms} value={roomKey} onChange={setRoomKey} isLoading={loadingRooms} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type</label>
                <SelectField instanceId="schedule-type" options={types} value={scheduleTypeKey} onChange={setScheduleTypeKey} isLoading={loadingTypes} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Organisateur</label>
                <SelectField instanceId="schedule-organizer" options={organizers} value={scheduleOrganizerKey} onChange={setScheduleOrganizerKey} isLoading={loadingOrganizers} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Début <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fin <span className="text-red-500">*</span></label>
                <input type="datetime-local" min={startsAt} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Délai (min)</label>
                <input type="number" min={0} value={delay} onChange={(e) => setDelay(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message</label>
                <input value={message} onChange={(e) => setMessage(e.target.value)} className="input" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Flags</label>
              <div className="flex gap-4 text-sm text-slate-600">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flagMoved} onChange={(e) => setFlagMoved(e.target.checked)} />moved</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flagCancelled} onChange={(e) => setFlagCancelled(e.target.checked)} />cancelled</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={flagAfterDark} onChange={(e) => setFlagAfterDark(e.target.checked)} />after_dark</label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Automation (JSON)</label>
              <textarea
                value={automationText}
                onChange={(e) => setAutomationText(e.target.value)}
                className="input font-mono text-xs"
                rows={5}
                placeholder='{"enabled": true}'
              />
            </div>

            {localError && <p className="text-xs text-red-500">{localError}</p>}
            {(createMutation.isError || updateMutation.isError) && (
              <p className="text-xs text-red-500">Une erreur est survenue. Vérifiez les champs puis réessayez.</p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={!canSave || isPending} className="btn-primary">
              {isPending ? <Spinner size="sm" color="white" /> : null}
              {isPending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
