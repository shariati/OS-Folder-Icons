'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionManager = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSyncSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/stripe/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('Subscription status synced successfully!');
        window.location.reload(); // Reload to reflect changes
      } else {
        alert('Failed to sync: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error syncing subscription:', error);
      alert('An error occurred while syncing.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user || !userProfile?.stripeCustomerId) return;

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        alert('Failed to redirect to subscription portal.');
      }
    } catch (error) {
      console.error('Error accessing portal:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-white/20">
      <div className="flex justify-between items-start mb-6">
        <div>
           <h3 className="text-xl font-bold text-gray-900 dark:text-white">Subscription Management</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your billing and plan details</p>
        </div>
        <button
            onClick={handleSyncSubscription}
            disabled={loading}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline disabled:opacity-50"
        >
            {loading ? 'Syncing...' : 'Sync Status'}
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Plan</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                    {userProfile.role === 'paid' ? 'Pro' : userProfile.role === 'lifetime' ? 'Lifetime' : 'Starter (Free)'}
                </p>
            </div>
             <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <div className="flex items-center gap-2">
                     <span className={`inline-block w-2.5 h-2.5 rounded-full ${userProfile.subscriptionStatus === 'active' || userProfile.role === 'lifetime' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {userProfile.subscriptionStatus || (userProfile.role === 'lifetime' ? 'Active' : 'Inactive')}
                    </p>
                </div>
            </div>
        </div>

        {userProfile.currentPeriodEnd && userProfile.role !== 'lifetime' && (
             <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-1">Next Billing / Renewal Date</p>
                <p className="text-base font-semibold text-blue-900 dark:text-blue-100">
                    {new Date(userProfile.currentPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
            </div>
        )}
            
        <div className="flex flex-wrap gap-4 pt-2">
            {userProfile.stripeCustomerId && (
                 <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-xl shadow-sm text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                >
                    Manage Billing & Invoices
                </button>
            )}

            {userProfile.role === 'free' && (
                 <a href="/#pricing" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5">
                    Upgrade to Pro
                </a>
            )}
        </div>
        
        {userProfile.stripeCustomerId && (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
                View your payment history and download invoices in thebilling portal.
            </p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
