'use client';

import { Check, Copy, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface CopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label?: string;
  value: string;
}

export function CopyModal({ isOpen, onClose, title, label, value }: CopyModalProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      // Select all text after a short delay
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div
        className="animate-in fade-in zoom-in-95 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl duration-200 dark:bg-gray-800"
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

        <div className="p-6">
          {label && (
            <label
              htmlFor="modal-copy-input"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {label}
            </label>
          )}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id="modal-copy-input"
              type="text"
              value={value}
              readOnly
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                copied
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
