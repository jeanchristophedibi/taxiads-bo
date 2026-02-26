import type { Screen, ScreenStatus } from '../../domain/entities/screen';

interface RelationDto { key: string; value: string }

export interface ScreenDto {
  id: string;
  name: string;
  slug: string;
  screen_code: string;
  hostname: string | null;
  ip_address: string | null;
  status: string;
  last_ping_at: string | null;
  playlist: RelationDto | null;
  locations: RelationDto[];
  version: number;
  should_restart: boolean;
}

export interface MetaDto {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedScreensDto {
  data: ScreenDto[];
  meta: MetaDto;
}

const VALID_STATUSES: ScreenStatus[] = ['online', 'offline', 'uninitialized', 'restarting'];

export const toScreenEntity = (dto: ScreenDto): Screen => ({
  id: dto.id,
  name: dto.name,
  slug: dto.slug,
  screenCode: dto.screen_code,
  hostname: dto.hostname,
  ipAddress: dto.ip_address,
  status: VALID_STATUSES.includes(dto.status as ScreenStatus)
    ? (dto.status as ScreenStatus)
    : 'offline',
  lastPingAt: dto.last_ping_at,
  playlist: dto.playlist ?? null,
  locations: dto.locations ?? [],
  version: dto.version,
  shouldRestart: dto.should_restart,
});
