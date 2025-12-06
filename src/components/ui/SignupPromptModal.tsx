'use client';

import React from 'react';

import { X, UserPlus, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SignupPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SignupPromptModal({ isOpen, onClose, onConfirm }: SignupPromptModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          {/* Header Image / Icon */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/grid.svg')]"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white/20 p-4 rounded-full mb-4 backdrop-blur-md">
                <UserPlus size={48} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold">Join the Community</h3>
              <p className="text-blue-100 mt-2">Unlock downloads & exclusive features</p>
            </div>
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg shrink-0">
                  <ShieldCheck className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Quality First</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    We require signups to prevent bot spam and ensure we can keep providing high-quality, free customization tools for real users like you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg shrink-0">
                  <Zap className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Quick & Easy</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Creating an account takes less than 3 clicks. No credit card required.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 group"
              >
                Sign Up to Download
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-3.5 px-6 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-6">
              Already have an account? <span className="text-blue-500 font-medium cursor-pointer" onClick={onConfirm}>Log in</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
