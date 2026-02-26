import type { DashboardKpis } from '../../domain/entities/kpis';

export interface KpisDto {
  data: {
    screens: { total: number; online: number; offline: number };
    campaigns: { total: number; active: number; scheduled: number };
    playlists: { total: number };
    play_logs: { today: number };
  };
}

export const toKpisEntity = (dto: KpisDto): DashboardKpis => ({
  screens: dto.data.screens,
  campaigns: dto.data.campaigns,
  playlists: dto.data.playlists,
  playLogs: { today: dto.data.play_logs.today },
});
