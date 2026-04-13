'use client';

import { useState } from 'react';
import type { Screen } from '../../domain/entities/screen';
import { useValidateDeviceCodeMutation } from '../hooks/use-screen-mutations';
import { ScreenValidationCodeModal } from './screen-validation-code-modal';
import { useToast } from '@/shared/ui/toast-provider';
import type { AppError } from '@/shared/domain/app-error';
import { useAuthPermissions } from '@/shared/application/use-auth-permissions';

const extractValidationError = (error: unknown): string => {
  const fallback = 'Code de validation invalide ou expire.';
  if (!error || typeof error !== 'object') return fallback;

  const appError = error as AppError;
  const details = appError.details as { message?: string; errors?: { validation_code?: string[] } } | undefined;

  const fieldMsg = details?.errors?.validation_code?.[0];
  if (fieldMsg) return fieldMsg;
  if (details?.message) return details.message;
  if (appError.message) return appError.message;
  return fallback;
};

interface Props {
  screen: Screen;
  variant?: 'table' | 'grid';
}

export function ScreenValidateAction({ screen, variant = 'table' }: Props) {
  const { can } = useAuthPermissions();
  const toast = useToast();
  const validateCode = useValidateDeviceCodeMutation();
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!can('devices.validate_code') || screen.status !== 'uninitialized') return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setValidationError(null);
          setOpen(true);
        }}
        disabled={validateCode.isPending}
        className={variant === 'grid' ? 'btn-primary text-xs px-3 py-1.5' : 'btn-primary text-xs px-3 py-1'}
      >
        {validateCode.isPending ? 'Validation…' : 'Valider'}
      </button>

      {open && (
        <ScreenValidationCodeModal
          title={`Valider ${screen.name}`}
          subtitle="Entrez le code de validation (6 chiffres) pour activer cet ecran."
          isPending={validateCode.isPending}
          errorMessage={validationError}
          onClose={() => setOpen(false)}
          onConfirm={(validationCode) => {
            setValidationError(null);
            validateCode.mutate(validationCode, {
              onSuccess: (res) => {
                if (res && !res.ok) {
                  setValidationError(extractValidationError(res.error));
                  return;
                }
                toast.success('Écran validé');
                setOpen(false);
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
