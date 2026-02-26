import type { Location } from '../../domain/entities/location';

export interface LocationDto {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  type: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_m: number | null;
  is_active: boolean;
  campaigns_count: number | null;
  playlists_count: number | null;
  screens_count: number | null;
}

export const toLocationEntity = (dto: LocationDto): Location => ({
  id: dto.id,
  name: dto.name,
  city: dto.city,
  country: dto.country,
  type: dto.type,
  latitude: dto.latitude,
  longitude: dto.longitude,
  radiusM: dto.radius_m,
  isActive: dto.is_active,
  campaignsCount: dto.campaigns_count ?? 0,
  playlistsCount: dto.playlists_count ?? 0,
  screensCount: dto.screens_count ?? 0,
});
