import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Toast, ToastToggle } from 'flowbite-react';
import { IconCheck } from '../components/Icons';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    window.setTimeout(() => setToast(null), 2500);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);
  const isSuccess = toast?.type !== 'error';

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Toast>
            <div
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                isSuccess
                  ? 'bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200'
                  : 'bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200'
              }`}
            >
              <IconCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal text-gray-700 dark:text-gray-200">
              {toast.message}
            </div>
            <ToastToggle onDismiss={() => setToast(null)} />
          </Toast>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return ctx;
}