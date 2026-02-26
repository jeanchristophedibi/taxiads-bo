import type { PlayLog } from '../../domain/entities/play-log';

interface RelationDto { key: string; value: string }

export interface PlayLogDto {
  id: string;
  played_at: string;
  duration_ms: number;
  status: string;
  screen: RelationDto | null;
  campaign: RelationDto | null;
  creative: RelationDto | null;
  advertiser: RelationDto | null;
}

export const toPlayLogEntity = (dto: PlayLogDto): PlayLog => ({
  id: dto.id,
  playedAt: dto.played_at,
  durationMs: dto.duration_ms,
  status: dto.status,
  screen: dto.screen ?? null,
  campaign: dto.campaign ?? null,
  creative: dto.creative ?? null,
  advertiser: dto.advertiser ?? null,
});
