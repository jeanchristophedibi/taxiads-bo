import { AppError } from '@/shared/domain/app-error';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type {
  CustomEmergencyPayload,
  EmergencyType,
  ScreenRepository,
  UpdateScreenInput,
} from '../../domain/repositories/screen-repository';
import type { ScreenMapItem, ScreenMapMeta, ScreenStatus } from '../../domain/entities/screen';
import type { ScreenHealth, ScreenNowPlaying, ScreenTimeline } from '../../domain/entities/screen-live';
import type { PaginatedScreensDto, ScreenDto } from '../schemas/screen-dto';
import { toScreenEntity } from '../schemas/screen-dto';

const wrap = async <T>(fn: () => Promise<T>, message: string) => {
  try {
    return ok(await fn());
  } catch (error) {
    return err(error instanceof AppError ? error : new AppError('UNKNOWN', message, error));
  }
};

export class HttpScreenRepository implements ScreenRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(params?: { search?: string; status?: string; groupId?: string; page?: number; perPage?: number }) {
    try {
      const response = await this.httpClient.request<PaginatedScreensDto>({
        path: '/bo/screens',
        query: {
          search: params?.search,
          status: params?.status,
          group_id: params?.groupId,
          page: params?.page,
          per_page: params?.perPage,
        },
      });
      return ok({
        data: response.data.map(toScreenEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      });
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch screens', error));
    }
  }

  async getById(id: string) {
    try {
      const response = await this.httpClient.request<{ data: ScreenDto }>({ path: `/bo/screens/${id}` });
      return ok(toScreenEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch screen', error));
    }
  }

  async getNowPlaying(id: string) {
    return wrap(async () => {
      const response = await this.httpClient.request<{
        data: {
          screen: { id: string; key: string; name: string; slug: string; status: string };
          playlist: { key: string; value: string; campaign?: { key: string; value: string; status: string } | null } | null;
          now_playing: {
            played_at: string | null;
            duration_ms: number | null;
            status: string;
            metadata: Record<string, unknown> | null;
            playlist_item: {
              key: string;
              title: string | null;
              duration: number | null;
              starts_at: string | null;
              ends_at: string | null;
              page: { key: string; value: string; component: string | null; path: string | null } | null;
              layout: { key: string; value: string; component: string | null } | null;
            } | null;
            creative: { key: string; value: string } | null;
            campaign: { key: string; value: string; status: string } | null;
            advertiser: { key: string; value: string } | null;
          } | null;
          last_played_at: string | null;
          estimated_until: string | null;
          lookback_minutes: number;
          generated_at: string;
        };
      }>({ path: `/bo/screens/${id}/now-playing` });

      const data = response.data;

      const mapped: ScreenNowPlaying = {
        screen: data.screen,
        playlist: data.playlist ?? null,
        nowPlaying: data.now_playing
          ? {
              playedAt: data.now_playing.played_at,
              durationMs: data.now_playing.duration_ms,
              status: data.now_playing.status,
              metadata: data.now_playing.metadata,
              playlistItem: data.now_playing.playlist_item
                ? {
                    key: data.now_playing.playlist_item.key,
                    title: data.now_playing.playlist_item.title,
                    duration: data.now_playing.playlist_item.duration,
                    startsAt: data.now_playing.playlist_item.starts_at,
                    endsAt: data.now_playing.playlist_item.ends_at,
                    page: data.now_playing.playlist_item.page,
                    layout: data.now_playing.playlist_item.layout,
                  }
                : null,
              creative: data.now_playing.creative,
              campaign: data.now_playing.campaign,
              advertiser: data.now_playing.advertiser,
            }
          : null,
        lastPlayedAt: data.last_played_at,
        estimatedUntil: data.estimated_until,
        lookbackMinutes: data.lookback_minutes,
        generatedAt: data.generated_at,
      };

      return mapped;
    }, 'Failed to fetch now playing');
  }

  async getTimeline(id: string, params?: { windowHours?: number; limit?: number; historyLimit?: number }) {
    return wrap(async () => {
      const response = await this.httpClient.request<{
        data: {
          screen: { id: string; key: string; name: string; slug: string };
          playlist: { key: string; value: string } | null;
          window: { starts_at: string; ends_at: string; hours: number };
          items: Array<{
            key: string;
            title: string | null;
            sort: number | null;
            duration: number | null;
            starts_at: string | null;
            ends_at: string | null;
            is_active: boolean;
            state: 'always' | 'scheduled' | 'active' | 'expired';
            page: { key: string; value: string; component: string | null; path: string | null } | null;
            layout: { key: string; value: string; component: string | null } | null;
            creative: { key: string; value: string } | null;
            computed_at: string;
          }>;
          recent_history: Array<{
            played_at: string | null;
            duration_ms: number | null;
            status: string;
            creative: { key: string; value: string } | null;
            campaign: { key: string; value: string; status: string } | null;
            playlist_item: { key: string; title: string | null } | null;
          }>;
          generated_at: string;
        };
      }>({
        path: `/bo/screens/${id}/timeline`,
        query: {
          window_hours: params?.windowHours,
          limit: params?.limit,
          history_limit: params?.historyLimit,
        },
      });

      const data = response.data;
      const mapped: ScreenTimeline = {
        screen: data.screen,
        playlist: data.playlist,
        window: {
          startsAt: data.window.starts_at,
          endsAt: data.window.ends_at,
          hours: data.window.hours,
        },
        items: data.items.map((item) => ({
          key: item.key,
          title: item.title,
          sort: item.sort,
          duration: item.duration,
          startsAt: item.starts_at,
          endsAt: item.ends_at,
          isActive: item.is_active,
          state: item.state,
          page: item.page,
          layout: item.layout,
          creative: item.creative,
          computedAt: item.computed_at,
        })),
        recentHistory: data.recent_history.map((item) => ({
          playedAt: item.played_at,
          durationMs: item.duration_ms,
          status: item.status,
          creative: item.creative,
          campaign: item.campaign,
          playlistItem: item.playlist_item,
        })),
        generatedAt: data.generated_at,
      };

      return mapped;
    }, 'Failed to fetch timeline');
  }

  async getHealth(id: string, params?: { staleAfterSeconds?: number }) {
    return wrap(async () => {
      const response = await this.httpClient.request<{
        data: {
          screen: {
            id: string;
            key: string;
            name: string;
            slug: string;
            screen_code: string;
            status: string;
            is_live: boolean;
            should_restart: boolean;
            provisioned: boolean;
          };
          connectivity: {
            last_ping_at: string | null;
            last_telemetry_at: string | null;
            seconds_since_last_activity: number | null;
            stale_after_seconds: number;
            hostname: string | null;
            ip_address: string | null;
            mac_address: string | null;
          };
          device: {
            battery: number | null;
            os: string | null;
            app_version: string | null;
            network_type: string | null;
            network_ssid: string | null;
            lat: number | null;
            lng: number | null;
          };
          last_error: {
            played_at: string | null;
            status: string;
            metadata: Record<string, unknown> | null;
          } | null;
          generated_at: string;
        };
      }>({
        path: `/bo/screens/${id}/health`,
        query: { stale_after_seconds: params?.staleAfterSeconds },
      });

      const data = response.data;
      const mapped: ScreenHealth = {
        screen: {
          id: data.screen.id,
          key: data.screen.key,
          name: data.screen.name,
          slug: data.screen.slug,
          screenCode: data.screen.screen_code,
          status: data.screen.status,
          isLive: data.screen.is_live,
          shouldRestart: data.screen.should_restart,
          provisioned: data.screen.provisioned,
        },
        connectivity: {
          lastPingAt: data.connectivity.last_ping_at,
          lastTelemetryAt: data.connectivity.last_telemetry_at,
          secondsSinceLastActivity: data.connectivity.seconds_since_last_activity,
          staleAfterSeconds: data.connectivity.stale_after_seconds,
          hostname: data.connectivity.hostname,
          ipAddress: data.connectivity.ip_address,
          macAddress: data.connectivity.mac_address,
        },
        device: {
          battery: data.device.battery,
          os: data.device.os,
          appVersion: data.device.app_version,
          networkType: data.device.network_type,
          networkSsid: data.device.network_ssid,
          lat: data.device.lat,
          lng: data.device.lng,
        },
        lastError: data.last_error
          ? {
              playedAt: data.last_error.played_at,
              status: data.last_error.status,
              metadata: data.last_error.metadata,
            }
          : null,
        generatedAt: data.generated_at,
      };

      return mapped;
    }, 'Failed to fetch screen health');
  }

  async update(id: string, data: UpdateScreenInput) {
    try {
      const response = await this.httpClient.request<{ data: ScreenDto }>({
        path: `/bo/screens/${id}`,
        method: 'PUT',
        body: data,
      });
      return ok(toScreenEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to update screen', error));
    }
  }

  async delete(id: string) {
    return wrap(() => this.httpClient.request({ path: `/bo/screens/${id}`, method: 'DELETE' }).then(() => undefined), 'Failed to delete screen');
  }

  /* ── Single actions ────────────────────────────────────────────────────── */

  async refresh(id: string) {
    return wrap(() => this.httpClient.request({ path: `/bo/screens/${id}/refresh`, method: 'POST' }).then(() => undefined), 'Failed to refresh screen');
  }

  async restart(id: string) {
    return wrap(() => this.httpClient.request({ path: `/bo/screens/${id}/restart`, method: 'POST' }).then(() => undefined), 'Failed to restart screen');
  }

  async assignPlaylist(id: string, playlistKey: string) {
    return wrap(
      () => this.httpClient.request({ path: `/bo/screens/${id}/assign-playlist`, method: 'POST', body: { playlist_key: playlistKey } }).then(() => undefined),
      'Failed to assign playlist',
    );
  }

  async unassignPlaylist(id: string) {
    return wrap(() => this.httpClient.request({ path: `/bo/screens/${id}/unassign-playlist`, method: 'POST' }).then(() => undefined), 'Failed to unassign playlist');
  }

  async updateStatus(id: string, status: ScreenStatus) {
    return wrap(
      () => this.httpClient.request({ path: `/bo/screens/${id}/status`, method: 'POST', body: { status } }).then(() => undefined),
      'Failed to update status',
    );
  }

  async emergency(id: string, type: EmergencyType, payload?: CustomEmergencyPayload) {
    return wrap(
      () => this.httpClient.request({ path: `/bo/screens/${id}/emergency/${type}`, method: 'POST', body: payload }).then(() => undefined),
      'Failed to trigger emergency',
    );
  }

  async getMap(params?: {
    search?: string;
    status?: ScreenStatus;
    locationKey?: string;
    campaignKey?: string;
    playlistKey?: string;
    staleAfterSeconds?: number;
  }) {
    return wrap(async () => {
      const response = await this.httpClient.request<{
        data: Array<{
          key: string;
          name: string;
          slug: string;
          screen_code: string;
          status: ScreenStatus;
          is_live: boolean;
          coordinates: { lat: number; lng: number; source: string } | null;
          last_ping_at: string | null;
          last_telemetry_at: string | null;
          battery: number | null;
          network_type: string | null;
          network_ssid: string | null;
          playlist: { key: string; value: string } | null;
          locations: { key: string; value: string }[];
        }>;
        meta: {
          total: number;
          stale_after_seconds: number;
          generated_at: string;
        };
      }>({
        path: '/bo/screens/map',
        query: {
          search: params?.search,
          status: params?.status,
          location_key: params?.locationKey,
          campaign_key: params?.campaignKey,
          playlist_key: params?.playlistKey,
          stale_after_seconds: params?.staleAfterSeconds,
        },
      });

      const data: ScreenMapItem[] = response.data.map((item) => ({
        key: item.key,
        name: item.name,
        slug: item.slug,
        screenCode: item.screen_code,
        status: item.status,
        isLive: item.is_live,
        coordinates: item.coordinates,
        lastPingAt: item.last_ping_at,
        lastTelemetryAt: item.last_telemetry_at,
        battery: item.battery,
        networkType: item.network_type,
        networkSsid: item.network_ssid,
        playlist: item.playlist,
        locations: item.locations ?? [],
      }));

      const meta: ScreenMapMeta = {
        total: response.meta.total,
        staleAfterSeconds: response.meta.stale_after_seconds,
        generatedAt: response.meta.generated_at,
      };

      return { data, meta };
    }, 'Failed to fetch screens map');
  }

  /* ── Bulk actions ──────────────────────────────────────────────────────── */

  async bulkRefresh(keys: string[]) {
    return wrap(() => this.httpClient.request({ path: '/bo/screens/bulk/refresh', method: 'POST', body: { screen_keys: keys } }).then(() => undefined), 'Failed to bulk refresh');
  }

  async bulkRestart(keys: string[]) {
    return wrap(() => this.httpClient.request({ path: '/bo/screens/bulk/restart', method: 'POST', body: { screen_keys: keys } }).then(() => undefined), 'Failed to bulk restart');
  }

  async bulkAssignPlaylist(keys: string[], playlistKey: string) {
    return wrap(
      () => this.httpClient.request({ path: '/bo/screens/bulk/assign-playlist', method: 'POST', body: { screen_keys: keys, playlist_key: playlistKey } }).then(() => undefined),
      'Failed to bulk assign playlist',
    );
  }

  async bulkUnassignPlaylist(keys: string[]) {
    return wrap(() => this.httpClient.request({ path: '/bo/screens/bulk/unassign-playlist', method: 'POST', body: { screen_keys: keys } }).then(() => undefined), 'Failed to bulk unassign playlist');
  }

  async bulkDelete(keys: string[]) {
    return wrap(() => this.httpClient.request({ path: '/bo/screens/bulk/delete', method: 'POST', body: { screen_keys: keys } }).then(() => undefined), 'Failed to bulk delete');
  }

  async bulkEmergency(keys: string[], type: EmergencyType) {
    return wrap(
      () => this.httpClient.request({ path: '/bo/screens/bulk/emergency', method: 'POST', body: { screen_keys: keys, type } }).then(() => undefined),
      'Failed to bulk emergency',
    );
  }
}
