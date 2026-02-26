export interface DashboardKpis {
  screens: {
    total: number;
    online: number;
    offline: number;
    uninitialized?: number;
    uptimeRate?: number;
    withoutPlaylist?: number;
  };
  campaigns: {
    total: number;
    active: number;
    scheduled: number;
    budgetTotal?: number;
  };
  playlists: { total: number };
  playLogs: {
    today: number;
    last7Days?: number;
    last30Days?: number;
    previous7Days?: number;
    previous30Days?: number;
    peakHour?: number;
    topCampaigns?: Array<{ key: string; value: string; count: number }>;
  };
  devices?: {
    pendingAccessRequests?: number;
  };
}
