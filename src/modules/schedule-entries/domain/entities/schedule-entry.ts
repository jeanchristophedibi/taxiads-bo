export interface Relation {
  key: string;
  value: string;
}

export interface ScheduleEntry {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  room: Relation | null;
  scheduleType: Relation | null;
  scheduleOrganizer: Relation | null;
  flags: string[];
  delay: number;
  message: string | null;
  automation: unknown;
  createdAt: string;
  updatedAt: string;
  isActiveNow: boolean;
}
