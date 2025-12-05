'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function AdModal({ isOpen, onClose, onComplete }: AdModalProps) {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(5);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleComplete = () => {
    if (timeLeft === 0) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl max-w-md w-full relative shadow-2xl border border-gray-200 dark:border-gray-800">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          <X size={24} />
        </button>
        
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 animate-pulse">
            <span className="text-2xl font-bold">AD</span>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Advertisement</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please watch this ad to support our free service.
            </p>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - timeLeft) / 5) * 100}%` }}
            />
          </div>

          <button
            onClick={handleComplete}
            disabled={timeLeft > 0}
            className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
              timeLeft > 0
                ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
            }`}
          >
            {timeLeft > 0 ? `Wait ${timeLeft}s` : 'Skip & Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
