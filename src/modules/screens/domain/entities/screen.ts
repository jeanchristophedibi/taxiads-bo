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
