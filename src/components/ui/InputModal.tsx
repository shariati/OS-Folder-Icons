'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import clsx from 'clsx';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  label?: string;
  initialValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'text' | 'email' | 'password';
}

export function InputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  label,
  initialValue = '',
  placeholder,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'text',
}: InputModalProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      // Focus after a short delay to allow animation/rendering
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialValue]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div
        className="animate-in fade-in zoom-in-95 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl duration-200 dark:bg-gray-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <h3 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {label && (
              <label
                htmlFor="modal-input"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {label}
              </label>
            )}
            <input
              ref={inputRef}
              id="modal-input"
              type={type}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
            >
              <Check size={16} />
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
