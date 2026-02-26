'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeScreensModule } from '../../index';
import type { CustomEmergencyPayload, EmergencyType, UpdateScreenInput } from '../../domain/repositories/screen-repository';
import type { ScreenStatus } from '../../domain/entities/screen';

const useRepo = () => makeScreensModule().screenRepository;

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['screens'] });
};

/* ── Per-screen mutations ─────────────────────────────────────────────────── */

export const useRefreshScreenMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => useRepo().refresh(id),
    onSuccess: invalidate,
  });
};

export const useRestartScreenMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => useRepo().restart(id),
    onSuccess: invalidate,
  });
};

export const useAssignPlaylistMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, playlistKey }: { id: string; playlistKey: string }) =>
      useRepo().assignPlaylist(id, playlistKey),
    onSuccess: invalidate,
  });
};

export const useUnassignPlaylistMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => useRepo().unassignPlaylist(id),
    onSuccess: invalidate,
  });
};

export const useUpdateScreenStatusMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ScreenStatus }) =>
      useRepo().updateStatus(id, status),
    onSuccess: invalidate,
  });
};

export const useUpdateScreenMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScreenInput }) =>
      useRepo().update(id, data),
    onSuccess: invalidate,
  });
};

export const useDeleteScreenMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => useRepo().delete(id),
    onSuccess: invalidate,
  });
};

export const useEmergencyMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, type, payload }: { id: string; type: EmergencyType; payload?: CustomEmergencyPayload }) =>
      useRepo().emergency(id, type, payload),
    onSuccess: invalidate,
  });
};

/* ── Bulk mutations ───────────────────────────────────────────────────────── */

export const useBulkRefreshMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (keys: string[]) => useRepo().bulkRefresh(keys),
    onSuccess: invalidate,
  });
};

export const useBulkRestartMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (keys: string[]) => useRepo().bulkRestart(keys),
    onSuccess: invalidate,
  });
};

export const useBulkAssignPlaylistMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ keys, playlistKey }: { keys: string[]; playlistKey: string }) =>
      useRepo().bulkAssignPlaylist(keys, playlistKey),
    onSuccess: invalidate,
  });
};

export const useBulkUnassignPlaylistMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (keys: string[]) => useRepo().bulkUnassignPlaylist(keys),
    onSuccess: invalidate,
  });
};

export const useBulkDeleteMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (keys: string[]) => useRepo().bulkDelete(keys),
    onSuccess: invalidate,
  });
};

export const useBulkEmergencyMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ keys, type }: { keys: string[]; type: EmergencyType }) =>
      useRepo().bulkEmergency(keys, type),
    onSuccess: invalidate,
  });
};
