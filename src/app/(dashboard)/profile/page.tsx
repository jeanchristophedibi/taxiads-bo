'use client';

import { useState } from 'react';
import { ProfileSettingsPanel } from '@/modules/profile/presentation/components/profile-settings-panel';

export default function ProfilePage() {
  const [sectionFilter, setSectionFilter] = useState('');

  return (
    <div className="space-y-4">
      {/* <div className="card p-4">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Filtrer les sections du profil…"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            autoComplete="off"
            className="input pl-9"
          />
        </div>
      </div> */}

      <ProfileSettingsPanel showTitle sectionFilter={sectionFilter} />
    </div>
  );
}
