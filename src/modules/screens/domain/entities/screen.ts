export type ScreenStatus = 'online' | 'offline' | 'uninitialized' | 'restarting';

export interface Screen {
  id: string;
  name: string;
  slug: string;
  screenCode: string;
  hostname: string | null;
  ipAddress: string | null;
  status: ScreenStatus;
  lastPingAt: string | null;
  playlist: { key: string; value: string } | null;
  locations: { key: string; value: string }[];
  version: number;
  shouldRestart: boolean;
}

export interface ScreenMapItem {
  key: string;
  name: string;
  slug: string;
  screenCode: string;
  status: ScreenStatus;
  isLive: boolean;
  coordinates: { lat: number; lng: number; source: string } | null;
  lastPingAt: string | null;
  lastTelemetryAt: string | null;
  battery: number | null;
  networkType: string | null;
  networkSsid: string | null;
  playlist: { key: string; value: string } | null;
  locations: { key: string; value: string }[];
}

export interface ScreenMapMeta {
  total: number;
  staleAfterSeconds: number;
  generatedAt: string;
}
