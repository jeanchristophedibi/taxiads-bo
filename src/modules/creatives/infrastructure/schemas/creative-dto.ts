import type { Creative } from '../../domain/entities/creative';

interface RelationDto {
  key: string;
  value: string;
}

export interface CreativeDto {
  id: string;
  name: string;
  media_path: string | null;
  orientation: string | null;
  duration: number | null;
  is_active: boolean;
  campaign: RelationDto | null;
  playlist_items_count: number | null;
  play_logs_count: number | null;
  created_at: string | null;
}

export const toCreativeEntity = (dto: CreativeDto): Creative => ({
  id: dto.id,
  name: dto.name,
  mediaPath: dto.media_path,
  orientation: dto.orientation,
  duration: dto.duration,
  isActive: dto.is_active,
  campaign: dto.campaign,
  playlistItemsCount: dto.playlist_items_count ?? 0,
  playLogsCount: dto.play_logs_count ?? 0,
  createdAt: dto.created_at,
});
