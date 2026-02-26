export interface PlayLog {
  id: string;
  playedAt: string;
  durationMs: number;
  status: string;
  screen: { key: string; value: string } | null;
  campaign: { key: string; value: string } | null;
  creative: { key: string; value: string } | null;
  advertiser: { key: string; value: string } | null;
}
