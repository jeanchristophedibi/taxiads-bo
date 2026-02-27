import type { Relation, ScheduleEntry } from '../../domain/entities/schedule-entry';

interface RelationDto {
  key?: string;
  value?: string;
  id?: number | string;
  name?: string;
  title?: string;
}

export interface ScheduleEntryDto {
  id: string;
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at: string;
  room?: RelationDto | null;
  schedule_type?: RelationDto | null;
  schedule_organizer?: RelationDto | null;
  flags?: string[] | null;
  delay?: number | null;
  message?: string | null;
  automation?: unknown;
  created_at?: string;
  updated_at?: string;
  is_active_now?: boolean;
}

const normalizeRelation = (raw?: RelationDto | null): Relation | null => {
  if (!raw) return null;
  const key = String(raw.key ?? raw.id ?? '');
  const value = String(raw.value ?? raw.name ?? raw.title ?? key);
  if (!key) return null;
  return { key, value };
};

const computeIsActiveNow = (startsAt: string, endsAt: string) => {
  const now = Date.now();
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return start <= now && now <= end;
};

export const toScheduleEntryEntity = (dto: ScheduleEntryDto): ScheduleEntry => {
  const startsAt = dto.starts_at;
  const endsAt = dto.ends_at;

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? null,
    startsAt,
    endsAt,
    room: normalizeRelation(dto.room),
    scheduleType: normalizeRelation(dto.schedule_type),
    scheduleOrganizer: normalizeRelation(dto.schedule_organizer),
    flags: dto.flags ?? [],
    delay: dto.delay ?? 0,
    message: dto.message ?? null,
    automation: dto.automation ?? null,
    createdAt: dto.created_at ?? startsAt,
    updatedAt: dto.updated_at ?? endsAt,
    isActiveNow: typeof dto.is_active_now === 'boolean' ? dto.is_active_now : computeIsActiveNow(startsAt, endsAt),
  };
};
