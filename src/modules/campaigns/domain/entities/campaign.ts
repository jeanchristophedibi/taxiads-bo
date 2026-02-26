export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  objective: string | null;
  budget: string;
  startsAt: string | null;
  endsAt: string | null;
  advertiser: { key: string; value: string } | null;
  creativesCount: number;
  playlistsCount: number;
  createdAt: string;
}
