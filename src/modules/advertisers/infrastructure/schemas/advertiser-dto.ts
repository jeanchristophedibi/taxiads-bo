import type { Advertiser } from '../../domain/entities/advertiser';

export interface AdvertiserDto {
  id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  campaigns_count: number | null;
  play_logs_count: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const toAdvertiserEntity = (dto: AdvertiserDto): Advertiser => ({
  id: dto.id,
  name: dto.name,
  contactEmail: dto.contact_email,
  contactPhone: dto.contact_phone,
  campaignsCount: dto.campaigns_count ?? 0,
  playLogsCount: dto.play_logs_count ?? 0,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});
