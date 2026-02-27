import { AppError } from '@/shared/domain/app-error';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { PaginatedScreenGroupsDto, ScreenGroupDto } from '../schemas/screen-group-dto';
import { toScreenGroupEntity } from '../schemas/screen-group-dto';

export interface SaveScreenGroupInput {
  name: string;
  settings?: { timezone?: string } & Record<string, unknown>;
}

export interface UpdateScreenGroupInput {
  name?: string;
  settings?: { timezone?: string } & Record<string, unknown>;
}

export interface AssignScreenGroupPlaylistInput {
  playlistId?: number;
  playlistKey?: string;
}

export interface AssignScreenGroupPlaylistResult {
  screenGroup: { key: string; value: string };
  playlist: { key: string; value: string };
  affected: number;
  screenKeys: string[];
}

const wrap = async <T>(fn: () => Promise<T>, message: string) => {
  try {
    return ok(await fn());
  } catch (error) {
    return err(error instanceof AppError ? error : new AppError('UNKNOWN', message, error));
  }
};

export class HttpScreenGroupRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(params?: { search?: string; page?: number; perPage?: number }) {
    try {
      const response = await this.httpClient.request<PaginatedScreenGroupsDto>({
        path: '/bo/screen-groups',
        query: { search: params?.search, page: params?.page, per_page: params?.perPage },
      });
      return ok({
        data: response.data.map(toScreenGroupEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      });
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch screen groups', error));
    }
  }

  async getById(id: string) {
    return wrap(async () => {
      const response = await this.httpClient.request<{ data: ScreenGroupDto }>({
        path: `/bo/screen-groups/${id}`,
      });
      return toScreenGroupEntity(response.data);
    }, 'Failed to fetch screen group');
  }

  async create(data: SaveScreenGroupInput) {
    return wrap(async () => {
      const response = await this.httpClient.request<{ data: ScreenGroupDto }>({
        path: '/bo/screen-groups',
        method: 'POST',
        body: data,
      });
      return toScreenGroupEntity(response.data);
    }, 'Failed to create screen group');
  }

  async update(id: string, data: UpdateScreenGroupInput) {
    return wrap(async () => {
      const response = await this.httpClient.request<{ data: ScreenGroupDto }>({
        path: `/bo/screen-groups/${id}`,
        method: 'PUT',
        body: data,
      });
      return toScreenGroupEntity(response.data);
    }, 'Failed to update screen group');
  }

  async delete(id: string) {
    return wrap(
      () => this.httpClient.request({ path: `/bo/screen-groups/${id}`, method: 'DELETE' }).then(() => undefined),
      'Failed to delete screen group',
    );
  }

  async assignPlaylist(id: string, data: AssignScreenGroupPlaylistInput) {
    return wrap(async () => {
      const response = await this.httpClient.request<{
        data: {
          screen_group: { key: string; value: string };
          playlist: { key: string; value: string };
          affected: number;
          screen_keys: string[];
        };
      }>({
        path: `/bo/screen-groups/${id}/assign-playlist`,
        method: 'POST',
        body: {
          playlist_id: data.playlistId,
          playlist_key: data.playlistKey,
        },
      });

      return {
        screenGroup: response.data.screen_group,
        playlist: response.data.playlist,
        affected: response.data.affected,
        screenKeys: response.data.screen_keys ?? [],
      } satisfies AssignScreenGroupPlaylistResult;
    }, 'Failed to assign playlist to screen group');
  }
}
