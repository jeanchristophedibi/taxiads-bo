'use client';

import { useState } from 'react';
import { SelectField } from '@/shared/ui/select-field';
import { useOptionsQuery } from '@/shared/application/use-options-query';

interface Props {
  groupName: string;
  onConfirm: (playlistKey: string) => void;
  onClose: () => void;
  isPending?: boolean;
}

export function ScreenGroupAssignPlaylistModal({ groupName, onConfirm, onClose, isPending }: Props) {
  const { data: playlists = [], isLoading } = useOptionsQuery('playlists');
  const [playlistKey, setPlaylistKey] = useState('');

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-sheet w-full max-w-sm">
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Assigner une playlist</h2>
            <p className="text-xs text-slate-500 mt-0.5">{groupName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body space-y-3">
          <p className="text-sm" style={{ color: 'var(--apple-label)' }}>
            Cette action assignera la playlist a tous les ecrans du groupe et declenchera un refresh.
          </p>
          <SelectField
            instanceId="assign-screen-group-playlist-select"
            options={playlists}
            value={playlistKey}
            onChange={setPlaylistKey}
            placeholder="Choisir une playlist…"
            isLoading={isLoading}
          />
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          <button
            type="button"
            disabled={!playlistKey || isPending}
            onClick={() => onConfirm(playlistKey)}
            className="btn-primary"
          >
            {isPending ? (
              <>
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Assignation…
              </>
            ) : 'Assigner'}
          </button>
        </div>
      </div>
    </div>
  );
}
