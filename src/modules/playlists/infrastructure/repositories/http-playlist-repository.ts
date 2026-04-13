import { AppError } from '@/shared/domain/app-error';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { PlaylistDto } from '../schemas/playlist-dto';
import { toPlaylistEntity } from '../schemas/playlist-dto';

export interface CreatePlaylistInput {
  name: string;
  project_id?: string;
  campaign_id?: string;
}

export type UpdatePlaylistInput = Partial<CreatePlaylistInput>;

interface PaginatedPlaylistsDto {
  data: PlaylistDto[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}

interface RelationDto {
  key: string;
  value: string;
}

interface RelationWithMetaDto extends RelationDto {
  city?: string;
  status?: string;
  slug?: string;
}

export interface PlaylistDetail {
  id: string;
  name: string;
  type: string;
  internal_name: string | null;
  campaign: RelationWithMetaDto | null;
  project: RelationWithMetaDto | null;
  playlist_items_count: number;
  screens_count: number;
  locations_count: number;
  locations: RelationWithMetaDto[];
  screens: RelationWithMetaDto[];
  created_at: string | null;
  updated_at: string | null;
}

interface PlaylistDetailDto {
  data: PlaylistDetail;
}

export interface PlaylistItemEntity {
  id: string;
  title: string | null;
  duration: number;
  sort: number | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  content: Record<string, unknown> | null;
  creative: RelationDto | null;
  page: RelationDto | null;
  layout: RelationDto | null;
  created_at: string | null;
  updated_at: string | null;
}

interface PlaylistItemsDto {
  data: {
    playlist: RelationDto;
    items: PlaylistItemEntity[];
  };
}

export interface SavePlaylistItemInput {
  page_id: string;
  layout_id: string;
  creative_id?: string;
  media?: File;
  title?: string;
  duration?: number;
  sort?: number;
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
}

export interface AssignPlaylistInput {
  screen_keys?: string[];
  location_keys?: string[];
}

export class HttpPlaylistRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(params: { search?: string; page?: number; perPage?: number } = {}) {
    try {
      const response = await this.httpClient.request<PaginatedPlaylistsDto>({
        path: '/bo/playlists',
        query: { search: params.search, page: params.page, per_page: params.perPage },
      });
      return ok({
        data: response.data.map(toPlaylistEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      });
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch playlists', error));
    }
  }

  async get(id: string) {
    try {
      const response = await this.httpClient.request<PlaylistDetailDto>({
        path: `/bo/playlists/${id}`,
      });
      return ok(response.data);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch playlist detail', error));
    }
  }

  async create(data: CreatePlaylistInput) {
    try {
      const response = await this.httpClient.request<{ data: PlaylistDto }>({
        path: '/bo/playlists',
        method: 'POST',
        body: data,
      });
      return ok(toPlaylistEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to create playlist', error));
    }
  }

  async update(id: string, data: UpdatePlaylistInput) {
    try {
      const response = await this.httpClient.request<{ data: PlaylistDto }>({
        path: `/bo/playlists/${id}`,
        method: 'PUT',
        body: data,
      });
      return ok(toPlaylistEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to update playlist', error));
    }
  }

  async listItems(id: string) {
    try {
      const response = await this.httpClient.request<PlaylistItemsDto>({
        path: `/bo/playlists/${id}/items`,
      });
      return ok(response.data);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch playlist items', error));
    }
  }

  async createItem(id: string, data: SavePlaylistItemInput) {
    try {
      const { media, ...rest } = data;
      if (media) {
        const fd = new FormData();
        fd.append('page_id', rest.page_id);
        fd.append('layout_id', rest.layout_id);
        fd.append('media', media);
        if (rest.creative_id) fd.append('creative_id', rest.creative_id);
        if (rest.title) fd.append('title', rest.title);
        if (rest.duration != null) fd.append('duration', String(rest.duration));
        if (rest.sort != null) fd.append('sort', String(rest.sort));
        fd.append('is_active', rest.is_active === false ? '0' : '1');
        if (rest.starts_at) fd.append('starts_at', rest.starts_at);
        if (rest.ends_at) fd.append('ends_at', rest.ends_at);
        const response = await this.httpClient.request<{ data: PlaylistItemEntity }>({
          path: `/bo/playlists/${id}/items`,
          method: 'POST',
          formData: fd,
        });
        return ok(response.data);
      }
      const response = await this.httpClient.request<{ data: PlaylistItemEntity }>({
        path: `/bo/playlists/${id}/items`,
        method: 'POST',
        body: rest,
      });
      return ok(response.data);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to create playlist item', error));
    }
  }

  async updateItem(playlistId: string, itemId: string, data: Partial<SavePlaylistItemInput>) {
    try {
      const { media, ...rest } = data;
      if (media) {
        const fd = new FormData();
        fd.append('_method', 'PUT');
        fd.append('media', media);
        if (rest.page_id) fd.append('page_id', rest.page_id);
        if (rest.layout_id) fd.append('layout_id', rest.layout_id);
        if (rest.creative_id !== undefined) fd.append('creative_id', rest.creative_id ?? '');
        if (rest.title !== undefined) fd.append('title', rest.title ?? '');
        if (rest.duration != null) fd.append('duration', String(rest.duration));
        if (rest.sort != null) fd.append('sort', String(rest.sort));
        if (rest.is_active !== undefined) fd.append('is_active', rest.is_active ? '1' : '0');
        if (rest.starts_at !== undefined) fd.append('starts_at', rest.starts_at ?? '');
        if (rest.ends_at !== undefined) fd.append('ends_at', rest.ends_at ?? '');
        const response = await this.httpClient.request<{ data: PlaylistItemEntity }>({
          path: `/bo/playlists/${playlistId}/items/${itemId}`,
          method: 'POST',
          formData: fd,
        });
        return ok(response.data);
      }
      const response = await this.httpClient.request<{ data: PlaylistItemEntity }>({
        path: `/bo/playlists/${playlistId}/items/${itemId}`,
        method: 'PUT',
        body: rest,
      });
      return ok(response.data);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to update playlist item', error));
    }
  }

  async deleteItem(playlistId: string, itemId: string) {
    try {
      await this.httpClient.request({
        path: `/bo/playlists/${playlistId}/items/${itemId}`,
        method: 'DELETE',
      });
      return ok(undefined);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to delete playlist item', error));
    }
  }

  async assign(id: string, data: AssignPlaylistInput) {
    try {
      const response = await this.httpClient.request<{
        data: { playlist_id: string; assigned_screens: number; assigned_locations: number };
      }>({
        path: `/bo/playlists/${id}/assign`,
        method: 'POST',
        body: data,
      });
      return ok(response.data);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to assign playlist', error));
    }
  }
}
