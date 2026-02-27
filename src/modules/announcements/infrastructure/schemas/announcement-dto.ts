import type { Announcement } from '../../domain/entities/announcement';

export interface AnnouncementDto {
  id: string;
  title: string;
  content: string;
  starts_at: string;
  ends_at: string;
  is_active_now: boolean;
  created_at: string;
  updated_at: string;
}

export const toAnnouncementEntity = (dto: AnnouncementDto): Announcement => ({
  id: dto.id,
  title: dto.title,
  content: dto.content,
  startsAt: dto.starts_at,
  endsAt: dto.ends_at,
  isActiveNow: dto.is_active_now,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});
