export interface ScreenNowPlaying {
  screen: {
    id: string;
    key: string;
    name: string;
    slug: string;
    status: string;
  };
  playlist: {
    key: string;
    value: string;
    campaign?: { key: string; value: string; status: string } | null;
  } | null;
  nowPlaying: {
    playedAt: string | null;
    durationMs: number | null;
    status: string;
    metadata: Record<string, unknown> | null;
    playlistItem: {
      key: string;
      title: string | null;
      duration: number | null;
      startsAt: string | null;
      endsAt: string | null;
      page: { key: string; value: string; component: string | null; path: string | null } | null;
      layout: { key: string; value: string; component: string | null } | null;
    } | null;
    creative: { key: string; value: string } | null;
    campaign: { key: string; value: string; status: string } | null;
    advertiser: { key: string; value: string } | null;
  } | null;
  lastPlayedAt: string | null;
  estimatedUntil: string | null;
  lookbackMinutes: number;
  generatedAt: string;
}

export interface ScreenTimeline {
  screen: { id: string; key: string; name: string; slug: string };
  playlist: { key: string; value: string } | null;
  window: { startsAt: string; endsAt: string; hours: number };
  items: Array<{
    key: string;
    title: string | null;
    sort: number | null;
    duration: number | null;
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
    state: 'always' | 'scheduled' | 'active' | 'expired';
    page: { key: string; value: string; component: string | null; path: string | null } | null;
    layout: { key: string; value: string; component: string | null } | null;
    creative: { key: string; value: string } | null;
    computedAt: string;
  }>;
  recentHistory: Array<{
    playedAt: string | null;
    durationMs: number | null;
    status: string;
    creative: { key: string; value: string } | null;
    campaign: { key: string; value: string; status: string } | null;
    playlistItem: { key: string; title: string | null } | null;
  }>;
  generatedAt: string;
}

export interface ScreenHealth {
  screen: {
    id: string;
    key: string;
    name: string;
    slug: string;
    screenCode: string;
    status: string;
    isLive: boolean;
    shouldRestart: boolean;
    provisioned: boolean;
  };
  connectivity: {
    lastPingAt: string | null;
    lastTelemetryAt: string | null;
    secondsSinceLastActivity: number | null;
    staleAfterSeconds: number;
    hostname: string | null;
    ipAddress: string | null;
    macAddress: string | null;
  };
  device: {
    battery: number | null;
    os: string | null;
    appVersion: string | null;
    networkType: string | null;
    networkSsid: string | null;
    lat: number | null;
    lng: number | null;
  };
  lastError: {
    playedAt: string | null;
    status: string;
    metadata: Record<string, unknown> | null;
  } | null;
  generatedAt: string;
}
