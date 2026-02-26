import type { Playlist } from '../../domain/entities/playlist';

interface RelationDto { key: string; value: string }
interface CampaignRelationDto extends RelationDto { status?: string }

export interface PlaylistDto {
  id: string;
  name: string;
  type: string;
  internal_name: string | null;
  campaign: CampaignRelationDto | null;
  project: RelationDto | null;
  playlist_items_count: number;
  screens_count: number;
  locations_count: number;
  created_at: string;
}

export const toPlaylistEntity = (dto: PlaylistDto): Playlist => ({
  id: dto.id,
  name: dto.name,
  type: dto.type,
  internalName: dto.internal_name,
  campaign: dto.campaign ?? null,
  project: dto.project ?? null,
  playlistItemsCount: dto.playlist_items_count,
  screensCount: dto.screens_count,
  locationsCount: dto.locations_count,
  createdAt: dto.created_at,
});
