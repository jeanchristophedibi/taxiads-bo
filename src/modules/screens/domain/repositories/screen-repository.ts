import type { AppError } from '@/shared/domain/app-error';
import type { PaginatedResult } from '@/shared/domain/paginated';
import type { Result } from '@/shared/domain/result';
import type { Screen, ScreenMapItem, ScreenMapMeta, ScreenStatus } from '../entities/screen';
import type { ScreenHealth, ScreenNowPlaying, ScreenTimeline } from '../entities/screen-live';

export type EmergencyType = 'fire' | 'general' | 'custom' | 'test' | 'lifted' | 'disable';

export interface CustomEmergencyPayload {
  title: string;
  message: string;
  title_fr?: string;
  message_fr?: string;
}

export interface UpdateScreenInput {
  name?: string;
  playlist_key?: string | null;
  status?: ScreenStatus;
}

export interface ScreenRepository {
  list(params?: {
    search?: string;
    status?: ScreenStatus;
    page?: number;
    perPage?: number;
  }): Promise<Result<PaginatedResult<Screen>, AppError>>;

  getById(id: string): Promise<Result<Screen, AppError>>;
  getNowPlaying(id: string): Promise<Result<ScreenNowPlaying, AppError>>;
  getTimeline(id: string, params?: { windowHours?: number; limit?: number; historyLimit?: number }): Promise<Result<ScreenTimeline, AppError>>;
  getHealth(id: string, params?: { staleAfterSeconds?: number }): Promise<Result<ScreenHealth, AppError>>;
  update(id: string, data: UpdateScreenInput): Promise<Result<Screen, AppError>>;
  delete(id: string): Promise<Result<void, AppError>>;

  /* Single actions */
  refresh(id: string): Promise<Result<void, AppError>>;
  restart(id: string): Promise<Result<void, AppError>>;
  assignPlaylist(id: string, playlistKey: string): Promise<Result<void, AppError>>;
  unassignPlaylist(id: string): Promise<Result<void, AppError>>;
  updateStatus(id: string, status: ScreenStatus): Promise<Result<void, AppError>>;
  validateCode(validationCode: string): Promise<Result<void, AppError>>;
  emergency(id: string, type: EmergencyType, payload?: CustomEmergencyPayload): Promise<Result<void, AppError>>;

  getMap(params?: {
    search?: string;
    status?: ScreenStatus;
    locationKey?: string;
    campaignKey?: string;
    playlistKey?: string;
    staleAfterSeconds?: number;
  }): Promise<Result<{ data: ScreenMapItem[]; meta: ScreenMapMeta }, AppError>>;

  /* Bulk actions */
  bulkRefresh(keys: string[]): Promise<Result<void, AppError>>;
  bulkRestart(keys: string[]): Promise<Result<void, AppError>>;
  bulkAssignPlaylist(keys: string[], playlistKey: string): Promise<Result<void, AppError>>;
  bulkUnassignPlaylist(keys: string[]): Promise<Result<void, AppError>>;
  bulkDelete(keys: string[]): Promise<Result<void, AppError>>;
  bulkEmergency(keys: string[], type: EmergencyType): Promise<Result<void, AppError>>;
}
