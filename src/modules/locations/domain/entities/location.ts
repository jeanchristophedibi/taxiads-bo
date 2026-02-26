export interface Location {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  type: string | null;
  latitude: number | null;
  longitude: number | null;
  radiusM: number | null;
  isActive: boolean;
  campaignsCount: number;
  playlistsCount: number;
  screensCount: number;
}
