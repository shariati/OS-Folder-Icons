'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { User, Mail, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e0e5ec] dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#e0e5ec] dark:bg-gray-900 p-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Please Log In</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be logged in to view your profile.</p>
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
          Log In
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-gray-900 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account and subscription</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="md:col-span-1">
            <NeumorphBox className="p-6 flex flex-col items-center text-center h-full">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mb-4 relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                    <User size={40} />
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                {userProfile?.displayName || user.displayName || 'User'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>

              <div className="w-full space-y-3 text-left mt-4">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Mail size={16} className="text-blue-500" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Calendar size={16} className="text-blue-500" />
                  <span>Joined {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </NeumorphBox>
          </div>

          {/* Subscription Manager */}
          <div className="md:col-span-2">
            <SubscriptionManager />
          </div>
        </div>
      </div>
    </div>
  );
}
