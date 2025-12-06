'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

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
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl border transition-all transform animate-in slide-in-from-right-full fade-in zoom-in-95 duration-300 ease-out min-w-[320px] max-w-md",
              toast.type === 'success' && "bg-white dark:bg-gray-800 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400",
              toast.type === 'error' && "bg-white dark:bg-gray-800 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400",
              toast.type === 'info' && "bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400"
            )}
          >
            {toast.type === 'success' && <CheckCircle size={24} className="shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={24} className="shrink-0" />}
            {toast.type === 'info' && <Info size={24} className="shrink-0" />}
            <span className="text-base font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
