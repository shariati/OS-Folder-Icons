'use client';

import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import React, { createContext, useCallback, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'animate-in slide-in-from-right-full fade-in zoom-in-95 pointer-events-auto flex min-w-[320px] max-w-md transform items-center gap-4 rounded-xl border px-6 py-4 shadow-2xl transition-all duration-300 ease-out',
              toast.type === 'success' &&
                'border-green-200 bg-white text-green-700 dark:border-green-900 dark:bg-gray-800 dark:text-green-400',
              toast.type === 'error' &&
                'border-red-200 bg-white text-red-700 dark:border-red-900 dark:bg-gray-800 dark:text-red-400',
              toast.type === 'info' &&
                'border-blue-200 bg-white text-blue-700 dark:border-blue-900 dark:bg-gray-800 dark:text-blue-400'
            )}
          >
            {toast.type === 'success' && <CheckCircle size={24} className="shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={24} className="shrink-0" />}
            {toast.type === 'info' && <Info size={24} className="shrink-0" />}
            <span className="flex-1 text-base font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
