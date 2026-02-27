import { AppError } from '@/shared/domain/app-error';
import type { PaginatedResult } from '@/shared/domain/paginated';
import { err, ok } from '@/shared/domain/result';
import type { HttpClient } from '@/shared/infrastructure/http/http-client';
import type { ScheduleEntry } from '../../domain/entities/schedule-entry';
import type { ScheduleEntryDto } from '../schemas/schedule-entry-dto';
import { toScheduleEntryEntity } from '../schemas/schedule-entry-dto';

export interface ListScheduleEntriesQuery {
  search?: string;
  roomId?: number;
  roomKey?: string;
  scheduleTypeId?: number;
  scheduleTypeKey?: string;
  scheduleOrganizerId?: number;
  scheduleOrganizerKey?: string;
  startsFrom?: string;
  startsTo?: string;
  activeAt?: string;
  page?: number;
  perPage?: number;
}

export interface SaveScheduleEntryInput {
  title: string;
  description?: string;
  room_id?: number;
  room_key?: string;
  schedule_type_id?: number;
  schedule_type_key?: string;
  schedule_organizer_id?: number;
  schedule_organizer_key?: string;
  starts_at: string;
  ends_at: string;
  flags?: string[];
  delay?: number;
  message?: string;
  automation?: unknown;
}

export type UpdateScheduleEntryInput = Partial<SaveScheduleEntryInput>;

interface PaginatedScheduleEntriesDto {
  data: ScheduleEntryDto[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
}

interface ScheduleEntryEnvelopeDto {
  data: ScheduleEntryDto;
}

interface DeletedScheduleEntryDto {
  data: { id: string; title: string };
  message: string;
}

export class HttpScheduleEntryRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(query: ListScheduleEntriesQuery = {}) {
    try {
      const response = await this.httpClient.request<PaginatedScheduleEntriesDto>({
        path: '/bo/schedule-entries',
        query: {
          search: query.search,
          room_id: query.roomId,
          room_key: query.roomKey,
          schedule_type_id: query.scheduleTypeId,
          schedule_type_key: query.scheduleTypeKey,
          schedule_organizer_id: query.scheduleOrganizerId,
          schedule_organizer_key: query.scheduleOrganizerKey,
          starts_from: query.startsFrom,
          starts_to: query.startsTo,
          active_at: query.activeAt,
          page: query.page,
          per_page: query.perPage,
        },
      });

      const value: PaginatedResult<ScheduleEntry> = {
        data: response.data.map(toScheduleEntryEntity),
        meta: {
          currentPage: response.meta.current_page,
          perPage: response.meta.per_page,
          total: response.meta.total,
          lastPage: response.meta.last_page,
        },
      };

      return ok(value);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to fetch schedule entries', error));
    }
  }

  async create(data: SaveScheduleEntryInput) {
    try {
      const response = await this.httpClient.request<ScheduleEntryEnvelopeDto>({
        path: '/bo/schedule-entries',
        method: 'POST',
        body: data,
      });
      return ok(toScheduleEntryEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to create schedule entry', error));
    }
  }

  async update(id: string, data: UpdateScheduleEntryInput) {
    try {
      const response = await this.httpClient.request<ScheduleEntryEnvelopeDto>({
        path: `/bo/schedule-entries/${id}`,
        method: 'PUT',
        body: data,
      });
      return ok(toScheduleEntryEntity(response.data));
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to update schedule entry', error));
    }
  }

  async delete(id: string) {
    try {
      const response = await this.httpClient.request<DeletedScheduleEntryDto>({
        path: `/bo/schedule-entries/${id}`,
        method: 'DELETE',
      });
      return ok(response.data);
    } catch (error) {
      return err(error instanceof AppError ? error : new AppError('UNKNOWN', 'Failed to delete schedule entry', error));
    }
  }
}
