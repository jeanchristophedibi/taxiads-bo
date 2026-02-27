'use client';

import { useState } from 'react';
import ReactSelect from 'react-select';
import type { Playlist } from '../../domain/entities/playlist';
import { useAssignPlaylistMutation } from '../hooks/use-playlist-mutations';
import { useOptionsQuery } from '@/shared/application/use-options-query';
import { useToast } from '@/shared/ui/toast-provider';
import { Spinner } from '@/shared/ui/spinner';

interface Props {
  playlist: Playlist;
  onClose: () => void;
}

export function PlaylistAssignModal({ playlist, onClose }: Props) {
  const toast = useToast();
  const assign = useAssignPlaylistMutation();
  const { data: screens = [], isLoading: loadingScreens } = useOptionsQuery('screens');
  const { data: locations = [], isLoading: loadingLocations } = useOptionsQuery('locations');

  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const screenOptions = screens.map((s) => ({ value: s.key, label: s.value }));
  const locationOptions = locations.map((l) => ({ value: l.key, label: l.value }));

  const selectStyles = {
    menuPortal: (base: object) => ({ ...base, zIndex: 9999 }),
    control: (base: object, state: { isFocused: boolean }) => ({
      ...base,
      minHeight: 40,
      borderColor: state.isFocused ? 'var(--apple-blue)' : 'var(--apple-separator)',
      borderRadius: 10,
      boxShadow: state.isFocused ? '0 0 0 3px rgba(0,122,255,0.14)' : 'none',
      fontSize: 14,
    }),
    option: (base: object, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      fontSize: 14,
      backgroundColor: state.isSelected ? 'var(--apple-blue)' : state.isFocused ? '#f1f5f9' : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
    }),
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScreens.length && !selectedLocations.length) return;

    assign.mutate(
      {
        id: playlist.id,
        data: {
          screen_keys: selectedScreens.length ? selectedScreens : undefined,
          location_keys: selectedLocations.length ? selectedLocations : undefined,
        },
      },
      {
        onSuccess: (res) => {
          toast.success(
            `Assigné : ${res.assigned_screens} écran${res.assigned_screens > 1 ? 's' : ''}, ${res.assigned_locations} localisation${res.assigned_locations > 1 ? 's' : ''}`,
          );
          onClose();
        },
        onError: (err) => toast.error('Assignation', (err as Error).message),
      },
    );
  };

  const canSubmit = selectedScreens.length > 0 || selectedLocations.length > 0;

  return (
    <div className="modal-overlay">
      <div className="modal-sheet w-full max-w-md">
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Assigner la playlist</h2>
            <p className="text-xs text-slate-500 mt-0.5">{playlist.name}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <p className="text-xs text-slate-500">
              Sélectionnez les écrans et/ou les localisations auxquels assigner cette playlist. Les assignations existantes seront remplacées.
            </p>

            {/* Screens */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Écrans
                {selectedScreens.length > 0 && (
                  <span className="ml-1.5 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    {selectedScreens.length}
                  </span>
                )}
              </label>
              <ReactSelect
                instanceId="assign-screens"
                isMulti
                options={screenOptions}
                isLoading={loadingScreens}
                value={screenOptions.filter((o) => selectedScreens.includes(o.value))}
                onChange={(opts) => setSelectedScreens(opts.map((o) => o.value))}
                placeholder="Sélectionner des écrans…"
                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                menuPosition="fixed"
                styles={selectStyles}
                noOptionsMessage={() => 'Aucun écran trouvé'}
                loadingMessage={() => 'Chargement…'}
              />
            </div>

            {/* Locations */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Localisations
                {selectedLocations.length > 0 && (
                  <span className="ml-1.5 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    {selectedLocations.length}
                  </span>
                )}
              </label>
              <ReactSelect
                instanceId="assign-locations"
                isMulti
                options={locationOptions}
                isLoading={loadingLocations}
                value={locationOptions.filter((o) => selectedLocations.includes(o.value))}
                onChange={(opts) => setSelectedLocations(opts.map((o) => o.value))}
                placeholder="Sélectionner des localisations…"
                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                menuPosition="fixed"
                styles={selectStyles}
                noOptionsMessage={() => 'Aucune localisation trouvée'}
                loadingMessage={() => 'Chargement…'}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={!canSubmit || assign.isPending} className="btn-primary">
              {assign.isPending ? <Spinner size="sm" color="white" /> : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
              {assign.isPending ? 'Assignation…' : 'Assigner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
