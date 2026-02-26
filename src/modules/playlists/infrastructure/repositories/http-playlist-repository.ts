import { AppError } from '@/shared/domain/app-error';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { PlaylistDto } from '../schemas/playlist-dto';
import { toPlaylistEntity } from '../schemas/playlist-dto';

export interface CreatePlaylistInput {
  name: string;
  project_id?: string;
  campaign_id?: string;
  type?: string;
  internal_name?: string;
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
  title?: string;
  duration?: number;
  sort?: number;
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
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
      const response = await this.httpClient.request<{ data: PlaylistItemEntity }>({
        path: `/bo/playlists/${id}/items`,
        method: 'POST',
        body: data,
      });
      return ok(response.data);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to create playlist item', error));
    }
  }

  async updateItem(playlistId: string, itemId: string, data: Partial<SavePlaylistItemInput>) {
    try {
      const response = await this.httpClient.request<{ data: PlaylistItemEntity }>({
        path: `/bo/playlists/${playlistId}/items/${itemId}`,
        method: 'PUT',
        body: data,
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
}
