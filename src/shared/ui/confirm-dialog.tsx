'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface Pending {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) => new Promise<boolean>((resolve) => setPending({ options, resolve })),
    [],
  );

  const answer = (value: boolean) => {
    pending?.resolve(value);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && typeof document !== 'undefined' && createPortal(
        <div
          className="modal-overlay"
          style={{ zIndex: 9990 }}
          onClick={() => answer(false)}
        >
          <div
            className="modal-sheet w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="text-base font-semibold text-gray-900">{pending.options.title}</h2>
            </div>

            {pending.options.message && (
              <div className="modal-body">
                <p className="text-sm text-slate-500">{pending.options.message}</p>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" onClick={() => answer(false)} className="btn-secondary">
                Annuler
              </button>
              <button
                type="button"
                onClick={() => answer(true)}
                className={pending.options.danger ? 'btn-danger' : 'btn-primary'}
              >
                {pending.options.confirmLabel ?? 'Confirmer'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
