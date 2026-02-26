'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_META: Record<ToastType, { label: string; icon: string; className: string }> = {
  success: {
    label: 'Succès',
    icon: '✓',
    className: 'toast-success',
  },
  error: {
    label: 'Erreur',
    icon: '!',
    className: 'toast-error',
  },
  info: {
    label: 'Info',
    icon: 'i',
    className: 'toast-info',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const durationMs = 3500;

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { ...toast, id }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, durationMs);
  }, [durationMs]);

  const remove = (id: number) => setToasts((prev) => prev.filter((item) => item.id !== id));

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] w-[360px] max-w-[92vw] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-card ${TOAST_META[toast.type].className} pointer-events-auto`}
            style={{ ['--toast-duration' as string]: `${durationMs}ms` }}
          >
            <div className="toast-content">
              <div className="toast-icon" aria-hidden="true">{TOAST_META[toast.type].icon}</div>
              <div className="min-w-0">
                <p className="toast-kind">{TOAST_META[toast.type].label}</p>
                <p className="toast-title">{toast.title}</p>
                {toast.message && <p className="toast-message">{toast.message}</p>}
              </div>
              <button
                onClick={() => remove(toast.id)}
                className="toast-close"
                aria-label="Fermer la notification"
              >
                ✕
              </button>
            </div>
            <div className="toast-progress" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return {
    success: (title: string, message?: string) => ctx.showToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => ctx.showToast({ type: 'error', title, message }),
    info: (title: string, message?: string) => ctx.showToast({ type: 'info', title, message }),
  };
}
