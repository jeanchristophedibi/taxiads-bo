import type { Screen } from '../../domain/entities/screen';

export interface ScreenRowVm {
  id: string;
  name: string;
  slug: string;
  status: Screen['status'];
  location: string;
  lastSeen: string;
  shouldRestart: boolean;
}

export const toScreenRowVm = (screen: Screen): ScreenRowVm => ({
  id: screen.id,
  name: screen.name,
  slug: screen.slug,
  status: screen.status,
  location: screen.locations.map((l) => l.value).join(', ') || '—',
  lastSeen: screen.lastPingAt ?? '—',
  shouldRestart: screen.shouldRestart,
});
