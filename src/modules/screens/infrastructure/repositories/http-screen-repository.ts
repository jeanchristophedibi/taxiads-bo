import { AppError } from '@/shared/domain/app-error';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type {
  CustomEmergencyPayload,
  EmergencyType,
  ScreenRepository,
  UpdateScreenInput,
} from '../../domain/repositories/screen-repository';
import type { ScreenStatus } from '../../domain/entities/screen';
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

  async list(params?: { search?: string; status?: string; page?: number; perPage?: number }) {
    try {
      const response = await this.httpClient.request<PaginatedScreensDto>({
        path: '/bo/screens',
        query: {
          search: params?.search,
          status: params?.status,
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
