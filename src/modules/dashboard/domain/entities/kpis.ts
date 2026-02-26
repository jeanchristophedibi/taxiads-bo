export interface DashboardKpis {
  screens: { total: number; online: number; offline: number };
  campaigns: { total: number; active: number; scheduled: number };
  playlists: { total: number };
  playLogs: { today: number };
}
