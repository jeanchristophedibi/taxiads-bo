'use client';

import { useState } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  isPending?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (validationCode: string) => void;
}

export function ScreenValidationCodeModal({
  title = "Validation d'ecran",
  subtitle = 'Entrez le code de validation pour confirmer cette action.',
  confirmLabel = 'Valider',
  isPending = false,
  errorMessage = null,
  onClose,
  onConfirm,
}: Props) {
  const [validationCode, setValidationCode] = useState('');
  const normalized = validationCode.trim();
  const isValidCode = /^\d{6}$/.test(normalized);

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="modal-sheet w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-apple text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body space-y-3">
          {errorMessage && (
            <div className="rounded-apple border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm font-medium text-red-700">{errorMessage}</p>
            </div>
          )}
          <p className="text-sm text-slate-500">{subtitle}</p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Code de validation (6 chiffres)</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={validationCode}
              onChange={(e) => setValidationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              pattern="[0-9]{6}"
              className="input tracking-widest"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isPending}>Annuler</button>
          <button
            type="button"
            onClick={() => onConfirm(normalized)}
            className="btn-primary"
            disabled={!isValidCode || isPending}
          >
            {isPending ? 'Validation...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
