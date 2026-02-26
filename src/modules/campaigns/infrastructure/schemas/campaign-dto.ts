import type { Campaign, CampaignStatus } from '../../domain/entities/campaign';

interface RelationDto { key: string; value: string }

export interface CampaignDto {
  id: string;
  name: string;
  status: string;
  objective: string | null;
  budget: string;
  starts_at: string | null;
  ends_at: string | null;
  advertiser: RelationDto | null;
  creatives_count: number;
  playlists_count: number;
  created_at: string;
}

const VALID_STATUSES: CampaignStatus[] = ['draft', 'scheduled', 'active', 'paused', 'completed', 'archived'];

export const toCampaignEntity = (dto: CampaignDto): Campaign => ({
  id: dto.id,
  name: dto.name,
  status: VALID_STATUSES.includes(dto.status as CampaignStatus) ? (dto.status as CampaignStatus) : 'draft',
  objective: dto.objective,
  budget: dto.budget,
  startsAt: dto.starts_at,
  endsAt: dto.ends_at,
  advertiser: dto.advertiser ?? null,
  creativesCount: dto.creatives_count,
  playlistsCount: dto.playlists_count,
  createdAt: dto.created_at,
});
