'use client';

import { useState } from 'react';
import { useAuthPermissions } from '@/shared/application/use-auth-permissions';
import { useToast } from '@/shared/ui/toast-provider';
import type { AppError } from '@/shared/domain/app-error';
import { ScreenValidationCodeModal } from './screen-validation-code-modal';
import { useValidateDeviceCodeMutation } from '../hooks/use-screen-mutations';
import { usePendingDeviceRequestsQuery } from '../hooks/use-pending-device-requests-query';

const extractValidationError = (error: unknown): string => {
  const fallback = 'Code de validation invalide ou expire.';
  if (!error || typeof error !== 'object') return fallback;

  const appError = error as AppError;
  const details = appError.details as { message?: string; errors?: { validation_code?: string[] } } | undefined;

  return details?.errors?.validation_code?.[0] ?? details?.message ?? appError.message ?? fallback;
};

interface Props {
  search?: string;
  page?: number;
  onPageChange?: (page: number) => void;
}

export function PendingDeviceRequestsTable({ search, page = 1, onPageChange }: Props) {
  const { can } = useAuthPermissions();
  const toast = useToast();
  const validateCode = useValidateDeviceCodeMutation();
  const { data, isLoading, isError } = usePendingDeviceRequestsQuery({ search, page, perPage: 20 });
  const [openFor, setOpenFor] = useState<{ title: string; validationCode: string | null } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-slate-500">Chargement des demandes…</div>;
  }

  if (isError || !data?.ok) {
    return <div className="py-16 text-center text-sm text-red-500">Impossible de charger les demandes devices.</div>;
  }

  const items = data.value.data;
  const meta = data.value.meta;

  if (!items.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-slate-600">Aucune demande en attente</p>
        <p className="text-xs text-slate-400 mt-1">Les nouveaux devices Flutter apparaitront ici.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="tbl-head">
              <th>Device</th>
              <th>Type</th>
              <th>Écran lié</th>
              <th>Code</th>
              <th>Demandé le</th>
              <th>Note</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="tbl-body">
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <p className="text-sm font-medium text-slate-900">{item.hostname || 'Device sans hostname'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.androidId || item.fingerprint || item.id}</p>
                </td>
                <td className="text-sm text-slate-600">{item.clientType || 'screen'}</td>
                <td className="text-sm text-slate-600">
                  {item.screen ? (
                    <div>
                      <p className="font-medium text-slate-900">{item.screen.name}</p>
                      <p className="text-xs text-slate-400">{item.screen.screenCode}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400">Aucun écran affecté</span>
                  )}
                </td>
                <td className="text-sm">
                  {item.validationCode ? (
                    <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 font-mono text-amber-700">
                      {item.validationCode}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="text-xs text-slate-400 tabular-nums">
                  {item.accessRequestedAt ? item.accessRequestedAt.replace('T', ' ').slice(0, 16) : '—'}
                </td>
                <td className="text-sm text-slate-500">{item.accessRequestNotes || '—'}</td>
                <td className="px-3">
                  {can('devices.validate_code') && item.validationCode ? (
                    <button
                      type="button"
                      className="btn-primary text-xs px-3 py-1"
                      disabled={validateCode.isPending}
                      onClick={() => {
                        setValidationError(null);
                        setOpenFor({
                          title: `Valider ${item.hostname || item.androidId || 'ce device'}`,
                          validationCode: item.validationCode,
                        });
                      }}
                    >
                      {validateCode.isPending ? 'Validation…' : 'Valider'}
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--apple-separator)', background: 'rgba(249,249,251,0.7)' }}>
        <p className="text-xs" style={{ color: 'var(--apple-label)' }}>
          {meta.total} demande{meta.total > 1 ? 's' : ''} • page {meta.currentPage}/{meta.lastPage}
        </p>
        {meta.lastPage > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={meta.currentPage <= 1}
              onClick={() => onPageChange?.(meta.currentPage - 1)}
              className="btn-secondary text-xs px-3 py-1"
            >← Préc.</button>
            <button
              type="button"
              disabled={meta.currentPage >= meta.lastPage}
              onClick={() => onPageChange?.(meta.currentPage + 1)}
              className="btn-secondary text-xs px-3 py-1"
            >Suiv. →</button>
          </div>
        )}
      </div>

      {openFor && (
        <ScreenValidationCodeModal
          title={openFor.title}
          subtitle="Entrez le code de validation renvoyé par l'API pour approuver ce device."
          isPending={validateCode.isPending}
          errorMessage={validationError}
          onClose={() => setOpenFor(null)}
          onConfirm={(validationCode) => {
            setValidationError(null);
            validateCode.mutate(validationCode || openFor.validationCode || '', {
              onSuccess: (res) => {
                if (res && !res.ok) {
                  setValidationError(extractValidationError(res.error));
                  return;
                }
                toast.success('Device validé');
                setOpenFor(null);
              },
              onError: (err) => {
                setValidationError(extractValidationError(err));
              },
            });
          }}
        />
      )}
    </>
  );
}
