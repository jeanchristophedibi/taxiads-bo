'use client';

import type { Screen } from '../../domain/entities/screen';
import {
  useScreenHealthQuery,
  useScreenNowPlayingQuery,
  useScreenTimelineQuery,
} from '../hooks/use-screen-live-query';

const fmt = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{title}</p>
      {children}
    </div>
  );
}

export function ScreenLiveDetailsModal({ screen, onClose }: { screen: Screen; onClose: () => void }) {
  const nowPlaying = useScreenNowPlayingQuery(screen.id, true);
  const health = useScreenHealthQuery(screen.id, true);
  const timeline = useScreenTimelineQuery(screen.id, true);

  const nowPlayingData = nowPlaying.data?.ok ? nowPlaying.data.value : null;
  const healthData = health.data?.ok ? health.data.value : null;
  const timelineData = timeline.data?.ok ? timeline.data.value : null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div className="modal-sheet w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Détails live écran</h2>
            <p className="text-xs text-slate-500 mt-0.5">{screen.name} · {screen.slug}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="modal-body space-y-3 max-h-[70vh] overflow-auto">
          {(nowPlaying.isLoading || health.isLoading || timeline.isLoading) && (
            <p className="text-sm text-slate-500">Chargement des données live…</p>
          )}

          {(nowPlaying.data && !nowPlaying.data.ok) || (health.data && !health.data.ok) || (timeline.data && !timeline.data.ok) ? (
            <p className="text-sm text-red-500">Impossible de charger certaines données live.</p>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card title="Diffusion actuelle">
              <div className="text-sm text-slate-700 space-y-1">
                <p><span className="text-slate-500">Playlist:</span> {nowPlayingData?.playlist?.value ?? 'Aucune'}</p>
                <p><span className="text-slate-500">Élément:</span> {nowPlayingData?.nowPlaying?.playlistItem?.title ?? '—'}</p>
                <p><span className="text-slate-500">Créative:</span> {nowPlayingData?.nowPlaying?.creative?.value ?? '—'}</p>
                <p><span className="text-slate-500">Joué à:</span> {fmt(nowPlayingData?.lastPlayedAt)}</p>
                <p><span className="text-slate-500">Fin estimée:</span> {fmt(nowPlayingData?.estimatedUntil)}</p>
              </div>
            </Card>

            <Card title="Santé écran">
              <div className="text-sm text-slate-700 space-y-1">
                <p><span className="text-slate-500">Statut:</span> {healthData?.screen.status ?? '—'} {healthData?.screen.isLive ? '· live' : '· stale'}</p>
                <p><span className="text-slate-500">Dernier ping:</span> {fmt(healthData?.connectivity.lastPingAt)}</p>
                <p><span className="text-slate-500">Dernière télémétrie:</span> {fmt(healthData?.connectivity.lastTelemetryAt)}</p>
                <p><span className="text-slate-500">Batterie:</span> {healthData?.device.battery ?? '—'}%</p>
                <p><span className="text-slate-500">App:</span> {healthData?.device.appVersion ?? '—'}</p>
              </div>
            </Card>
          </div>

          <Card title="Timeline (24h)">
            <div className="space-y-2">
              {(timelineData?.items ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">Aucun item planifié.</p>
              ) : (
                timelineData?.items.slice(0, 10).map((item) => (
                  <div key={item.key} className="text-sm border-b last:border-b-0 border-slate-100 pb-1.5 last:pb-0">
                    <p className="font-medium text-slate-800">{item.title || '(sans titre)'}</p>
                    <p className="text-xs text-slate-500">{item.state} · {fmt(item.startsAt)} → {fmt(item.endsAt)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="Historique récent">
            <div className="space-y-2">
              {(timelineData?.recentHistory ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">Aucun play log récent.</p>
              ) : (
                timelineData?.recentHistory.slice(0, 8).map((row, index) => (
                  <div key={`${row.playedAt}-${index}`} className="text-sm border-b last:border-b-0 border-slate-100 pb-1.5 last:pb-0">
                    <p className="font-medium text-slate-800">{row.playlistItem?.title ?? 'Élément inconnu'}</p>
                    <p className="text-xs text-slate-500">{fmt(row.playedAt)} · {row.status} · {row.campaign?.value ?? 'sans campagne'}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">Fermer</button>
        </div>
      </div>
    </div>
  );
}
