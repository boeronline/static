import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  messageKey: string;
}

interface ToastContextValue {
  show: (tone: ToastTone, messageKey: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const useToastList = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((tone: ToastTone, messageKey: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, tone, messageKey }]);
    setTimeout(() => remove(id), 3200);
  }, [remove]);

  return { toasts, push, remove };
};

const ToastViewport: React.FC<{ toasts: Toast[]; onClose: (id: number) => void }> = ({ toasts, onClose }) => {
  const { t } = useTranslation();
  if (typeof document === 'undefined') return null;
  const container = document.getElementById('toast-root') ?? (() => {
    const node = document.createElement('div');
    node.id = 'toast-root';
    document.body.appendChild(node);
    return node;
  })();

  return createPortal(
    <div className="fixed inset-x-0 top-4 flex flex-col items-center gap-2 px-4 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`w-full max-w-sm rounded-xl px-4 py-3 shadow-md text-sm font-medium text-white focus-ring transition ${
            toast.tone === 'success'
              ? 'bg-emerald-500'
              : toast.tone === 'error'
              ? 'bg-rose-500'
              : 'bg-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{t(toast.messageKey)}</span>
            <button
              onClick={() => onClose(toast.id)}
              className="focus-ring rounded-full bg-white/20 px-2 py-1 text-xs"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>,
    container
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, push, remove } = useToastList();

  const value = useMemo(() => ({ show: push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
};
