'use client';

import { useState } from 'react';
import { PlayLogsTable } from '@/modules/play-logs/presentation/components/play-logs-table';

export default function PlayLogsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Play Logs</h1>

      <div className="flex gap-3 items-center">
        <label className="text-sm text-slate-500">Du</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="text-sm text-slate-500">au</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <PlayLogsTable from={from || undefined} to={to || undefined} />
      </div>
    </div>
  );
}
