'use client';

import { useState } from 'react';
import { ScheduleEntriesTable } from '@/modules/schedule-entries/presentation/components/schedule-entries-table';
import { ScheduleEntryFormModal } from '@/modules/schedule-entries/presentation/components/schedule-entry-form-modal';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import { SelectField } from '@/shared/ui/select-field';

export default function ProgrammesPage() {
  const [search, setSearch] = useState('');
  const [roomKey, setRoomKey] = useState('');
  const [scheduleTypeKey, setScheduleTypeKey] = useState('');
  const [scheduleOrganizerKey, setScheduleOrganizerKey] = useState('');
  const [startsFrom, setStartsFrom] = useState('');
  const [startsTo, setStartsTo] = useState('');
  const [activeAt, setActiveAt] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: rooms = [], isLoading: loadingRooms } = useOptionsQuery('rooms');
  const { data: types = [], isLoading: loadingTypes } = useOptionsQuery('schedule-types');
  const { data: organizers = [], isLoading: loadingOrganizers } = useOptionsQuery('schedule-organizers');

  const resetPage = () => setPage(1);

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Programmes</h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Gérez les entrées de planning: salle, type, organisateur, horaires, flags et automatisation.
            </p>
          </div>
          <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouveau programme
          </button>
        </div>

        <div className="toolbar grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="relative md:col-span-2 lg:col-span-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Titre, description, message..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="input pl-9"
            />
          </div>

          <SelectField instanceId="filter-room" options={rooms} value={roomKey} onChange={(v) => { setRoomKey(v); resetPage(); }} placeholder="Toutes les salles" isLoading={loadingRooms} />
          <SelectField instanceId="filter-type" options={types} value={scheduleTypeKey} onChange={(v) => { setScheduleTypeKey(v); resetPage(); }} placeholder="Tous les types" isLoading={loadingTypes} />
          <SelectField instanceId="filter-organizer" options={organizers} value={scheduleOrganizerKey} onChange={(v) => { setScheduleOrganizerKey(v); resetPage(); }} placeholder="Tous les organisateurs" isLoading={loadingOrganizers} />

          <input
            type="datetime-local"
            value={startsFrom}
            onChange={(e) => { setStartsFrom(e.target.value); resetPage(); }}
            className="input"
            placeholder="Début à partir de"
          />
          <input
            type="datetime-local"
            value={startsTo}
            onChange={(e) => { setStartsTo(e.target.value); resetPage(); }}
            className="input"
            placeholder="Début jusqu'à"
          />
          <input
            type="datetime-local"
            value={activeAt}
            onChange={(e) => { setActiveAt(e.target.value); resetPage(); }}
            className="input"
            placeholder="Actif à"
          />
        </div>

        <ScheduleEntriesTable
          search={search || undefined}
          roomKey={roomKey || undefined}
          scheduleTypeKey={scheduleTypeKey || undefined}
          scheduleOrganizerKey={scheduleOrganizerKey || undefined}
          startsFrom={startsFrom ? `${startsFrom}:00+00:00` : undefined}
          startsTo={startsTo ? `${startsTo}:00+00:00` : undefined}
          activeAt={activeAt ? `${activeAt}:00+00:00` : undefined}
          page={page}
          onPageChange={setPage}
        />
      </div>

      {createOpen && <ScheduleEntryFormModal onClose={() => setCreateOpen(false)} />}
    </>
  );
}
