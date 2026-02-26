'use client';

import { useKpisQuery } from '@/modules/dashboard/presentation/hooks/use-kpis-query';
import { ProfileSettingsPanel } from '@/modules/profile/presentation/components/profile-settings-panel';

function KpiCard({ label, value, sub, color }: {
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useKpisQuery();
  const kpis = data?.ok ? data.value : null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Écrans online"
          value={isLoading ? '…' : (kpis?.screens.online ?? '—')}
          sub={kpis ? `sur ${kpis.screens.total} total` : ''}
          color="text-emerald-600"
        />
        <KpiCard
          label="Campagnes actives"
          value={isLoading ? '…' : (kpis?.campaigns.active ?? '—')}
          sub={kpis ? `${kpis.campaigns.scheduled} planifiées` : ''}
          color="text-blue-600"
        />
        <KpiCard
          label="Playlists"
          value={isLoading ? '…' : (kpis?.playlists.total ?? '—')}
          sub="total"
          color="text-purple-600"
        />
        <KpiCard
          label="Diffusions / 24h"
          value={isLoading ? '…' : (kpis?.playLogs.today ?? '—')}
          sub="play logs aujourd'hui"
          color="text-slate-600"
        />
      </div>

      {!data?.ok && !isLoading && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-10 text-center text-sm text-slate-400">
          Données indisponibles
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Profil & Sécurité</h2>
        <ProfileSettingsPanel showTitle={false} />
      </section>
    </div>
  );
}
