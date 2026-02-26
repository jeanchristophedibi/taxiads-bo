import type { DashboardKpis } from '../../domain/entities/kpis';

export interface KpisDto {
  data?: Record<string, unknown>;
  screens?: Record<string, unknown>;
  campaigns?: Record<string, unknown>;
  playlists?: Record<string, unknown>;
  play_logs?: Record<string, unknown>;
  devices?: Record<string, unknown>;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

const asNumber = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const asNullableNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const asTopCampaigns = (value: unknown): Array<{ key: string; value: string; count: number }> => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const rec = asRecord(item);
      const key = String(rec.key ?? rec.id ?? '');
      const label = String(rec.value ?? rec.name ?? rec.label ?? '');
      const count = asNumber(rec.count ?? rec.total ?? rec.plays, 0);
      return { key, value: label, count };
    })
    .filter((item) => item.value);
};

export const toKpisEntity = (dto: KpisDto): DashboardKpis => {
  const root = asRecord(dto.data ?? dto);
  const screens = asRecord(root.screens);
  const campaigns = asRecord(root.campaigns);
  const playlists = asRecord(root.playlists);
  const playLogs = asRecord(root.play_logs);
  const devices = asRecord(root.devices);

  const uptimeRate = asNullableNumber(screens.uptime_rate ?? screens.uptime);
  const pendingAccessRequests = asNullableNumber(
    devices.pending_access_requests
      ?? devices.pending_requests
      ?? devices.access_requests_pending,
  );

  return {
    screens: {
      total: asNumber(screens.total),
      online: asNumber(screens.online),
      offline: asNumber(screens.offline),
      uninitialized: asNullableNumber(screens.uninitialized),
      uptimeRate,
      withoutPlaylist: asNullableNumber(
        screens.without_playlist
          ?? screens.without_playlist_assigned
          ?? screens.without_assigned_playlist,
      ),
    },
    campaigns: {
      total: asNumber(campaigns.total),
      active: asNumber(campaigns.active),
      scheduled: asNumber(campaigns.scheduled),
      budgetTotal: asNullableNumber(campaigns.budget_total ?? campaigns.total_budget),
    },
    playlists: {
      total: asNumber(playlists.total),
    },
    playLogs: {
      today: asNumber(playLogs.today),
      last7Days: asNullableNumber(playLogs.last_7_days ?? playLogs.days_7),
      last30Days: asNullableNumber(playLogs.last_30_days ?? playLogs.days_30),
      previous7Days: asNullableNumber(playLogs.previous_7_days),
      previous30Days: asNullableNumber(playLogs.previous_30_days),
      peakHour: asNullableNumber(playLogs.peak_hour),
      topCampaigns: asTopCampaigns(playLogs.top_campaigns),
    },
    devices: {
      pendingAccessRequests,
    },
  };
};
