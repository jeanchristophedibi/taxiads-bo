'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useKpisQuery } from '@/modules/dashboard/presentation/hooks/use-kpis-query';

function formatInt(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString('fr-FR');
}

function formatPercent(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '—';
  return `${Math.round(value)}%`;
}

function formatCurrency(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '—';
  return `${value.toLocaleString('fr-FR')} XOF`;
}

function computeDelta(current?: number, previous?: number): string {
  if (current === undefined || previous === undefined || previous === 0) return '—';
  const delta = ((current - previous) / previous) * 100;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${Math.round(delta)}% vs période précédente`;
}

function KpiTile({
  label,
  value,
  sub,
  accent,
  icon,
  delay,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <div className="card relative overflow-hidden animate-kpi-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--apple-label)' }}>{label}</p>
          <div className="w-9 h-9 rounded-apple flex items-center justify-center" style={{ background: `${accent}18`, color: accent }}>
            {icon}
          </div>
        </div>
        <p className="mt-4 text-[1.85rem] font-bold text-gray-900 tabular-nums leading-none tracking-tight">{value}</p>
        <p className="mt-2 text-xs" style={{ color: 'var(--apple-label)' }}>{sub}</p>
      </div>
    </div>
  );
}

function TileSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-3 w-28" />
      <div className="skeleton h-8 w-20" />
      <div className="skeleton h-2.5 w-36" />
    </div>
  );
}

const MonitorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" />
  </svg>
);
const InitIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M22 12h-6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
  </svg>
);
const LogIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
  </svg>
);
const CampaignIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z" />
  </svg>
);
const BudgetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M16 12h.01" /><path d="M2 9h20" />
  </svg>
);
const DeviceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" />
  </svg>
);

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { data, isLoading } = useKpisQuery();
  const kpis = data?.ok ? data.value : null;
  const initialQuery = searchParams.get('global') ?? '';
  const [query, setQuery] = useState(initialQuery);

  const screensTotal = kpis?.screens.total;
  const screensOnline = kpis?.screens.online;
  const uptime = kpis?.screens.uptimeRate ?? (screensTotal ? ((screensOnline ?? 0) / screensTotal) * 100 : undefined);

  const logs7 = kpis?.playLogs.last7Days;
  const logs30 = kpis?.playLogs.last30Days;
  const delta7 = computeDelta(kpis?.playLogs.last7Days, kpis?.playLogs.previous7Days);
  const delta30 = computeDelta(kpis?.playLogs.last30Days, kpis?.playLogs.previous30Days);

  const peakHour = kpis?.playLogs.peakHour;
  const peakHourLabel = peakHour === undefined ? '—' : `${String(peakHour).padStart(2, '0')}h`;

  const topCampaigns = kpis?.playLogs.topCampaigns ?? [];
  const filteredTopCampaigns = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topCampaigns;
    return topCampaigns.filter((campaign) => campaign.value.toLowerCase().includes(q));
  }, [query, topCampaigns]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Tableau de bord</h1>
        <p className="text-sm text-slate-500 mt-0.5">Vue d'ensemble de la plateforme TaxiAds</p>
      </div>

      <div className="card p-4">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrer le dashboard (campagnes top)..."
            className="input pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <TileSkeleton key={i} />)
        ) : (
          <>
            <KpiTile
              label="Disponibilité écrans"
              value={formatPercent(uptime)}
              sub={kpis ? `${formatInt(kpis.screens.online)}/${formatInt(kpis.screens.total)} en ligne` : 'données indisponibles'}
              icon={<MonitorIcon />}
              accent="var(--apple-green)"
              delay={0}
            />
            <KpiTile
              label="Écrans non initialisés"
              value={formatInt(kpis?.screens.uninitialized)}
              sub={kpis ? `${formatInt(kpis.screens.withoutPlaylist)} sans playlist` : 'données indisponibles'}
              icon={<InitIcon />}
              accent="var(--apple-orange)"
              delay={60}
            />
            <KpiTile
              label="Diffusions 7 jours"
              value={formatInt(logs7)}
              sub={delta7}
              icon={<LogIcon />}
              accent="var(--apple-blue)"
              delay={120}
            />
            <KpiTile
              label="Diffusions 30 jours"
              value={formatInt(logs30)}
              sub={delta30}
              icon={<LogIcon />}
              accent="var(--apple-purple)"
              delay={180}
            />
            <KpiTile
              label="Campagnes actives"
              value={formatInt(kpis?.campaigns.active)}
              sub={kpis ? `${formatInt(kpis.campaigns.scheduled)} planifiée(s)` : 'données indisponibles'}
              icon={<CampaignIcon />}
              accent="var(--apple-blue)"
              delay={240}
            />
            <KpiTile
              label="Budget total engagé"
              value={formatCurrency(kpis?.campaigns.budgetTotal)}
              sub={kpis ? `${formatInt(kpis.campaigns.total)} campagnes au total` : 'données indisponibles'}
              icon={<BudgetIcon />}
              accent="var(--apple-green)"
              delay={300}
            />
            <KpiTile
              label="Demandes devices en attente"
              value={formatInt(kpis?.devices?.pendingAccessRequests)}
              sub="activation à traiter"
              icon={<DeviceIcon />}
              accent="var(--apple-red)"
              delay={360}
            />
            <KpiTile
              label="Pic horaire diffusion"
              value={peakHourLabel}
              sub={kpis ? `${formatInt(kpis.playLogs.today)} diffusions aujourd'hui` : 'données indisponibles'}
              icon={<LogIcon />}
              accent="var(--apple-orange)"
              delay={420}
            />
          </>
        )}
      </div>

      <section className="card p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Top 5 campagnes par volume</h2>
            <p className="text-xs text-slate-500 mt-0.5">Classement des campagnes les plus diffusées</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-8 w-full" />
            ))}
          </div>
        ) : filteredTopCampaigns.length === 0 ? (
          <p className="text-sm text-slate-500">Données top campagnes non disponibles pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {filteredTopCampaigns.slice(0, 5).map((campaign, index) => (
              <div key={`${campaign.key}-${index}`} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-800 truncate">{campaign.value}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 tabular-nums">{formatInt(campaign.count)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
