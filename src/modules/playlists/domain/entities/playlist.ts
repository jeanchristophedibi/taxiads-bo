export interface Playlist {
  id: string;
  name: string;
  type: string;
  internalName: string | null;
  campaign: { key: string; value: string; status?: string } | null;
  project: { key: string; value: string } | null;
  playlistItemsCount: number;
  screensCount: number;
  locationsCount: number;
  createdAt: string;
}
