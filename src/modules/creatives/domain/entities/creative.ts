export interface Creative {
  id: string;
  name: string;
  mediaPath: string | null;
  orientation: string | null;
  duration: number | null;
  isActive: boolean;
  campaign: { key: string; value: string } | null;
  playlistItemsCount: number;
  playLogsCount: number;
  createdAt: string | null;
}
