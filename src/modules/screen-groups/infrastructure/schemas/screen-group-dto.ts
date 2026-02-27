import type { ScreenGroup } from '../../domain/entities/screen-group';

export interface ScreenGroupDto {
  id: string;
  name: string;
  settings: { timezone?: string } & Record<string, unknown>;
  screens_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedScreenGroupsDto {
  data: ScreenGroupDto[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}

export function toScreenGroupEntity(dto: ScreenGroupDto): ScreenGroup {
  return {
    id: dto.id,
    name: dto.name,
    settings: dto.settings ?? {},
    screensCount: dto.screens_count,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
