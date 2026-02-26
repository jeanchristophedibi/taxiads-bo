'use client';

import { useState } from 'react';
import { ScreensTable } from '@/modules/screens/presentation/components/screens-table';
import type { ScreenStatus } from '@/modules/screens/domain/entities/screen';

const STATUS_OPTIONS: { value: ScreenStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'online', label: 'En ligne' },
  { value: 'offline', label: 'Hors ligne' },
  { value: 'uninitialized', label: 'Non initialisé' },
  { value: 'restarting', label: 'Redémarrage' },
];

export default function EcransPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ScreenStatus | ''>('');

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Écrans</h1>
          <p className="text-sm text-slate-500 mt-0.5">Moniteur en temps réel des dispositifs d'affichage</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="toolbar">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un écran…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ScreenStatus | '')}
            className="input w-auto"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <ScreensTable search={search || undefined} status={status || undefined} />
      </div>
    </div>
  );
}
