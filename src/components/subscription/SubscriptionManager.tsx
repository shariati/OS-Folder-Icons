'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionManager = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!userProfile?.stripeCustomerId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: userProfile.stripeCustomerId,
          returnUrl: window.location.href,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error accessing portal:', error);
      alert('Failed to access subscription portal.');
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Subscription Management</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Plan</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {userProfile.role === 'paid' ? 'Pro' : userProfile.role === 'lifetime' ? 'Lifetime' : 'Starter (Free)'}
          </p>
        </div>

        {userProfile.role !== 'free' && (
          <>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                {userProfile.subscriptionStatus || 'Active'}
              </p>
            </div>

            {userProfile.currentPeriodEnd && (
                <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Billing / Renewal Date</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(userProfile.currentPeriodEnd).toLocaleDateString()}
                </p>
                </div>
            )}
            
            {userProfile.role !== 'lifetime' && (
                <div className="pt-4">
                <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Manage Subscription'}
                </button>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Update payment method, upgrade/downgrade, or cancel subscription.
                </p>
                </div>
            )}
          </>
        )}
        
        {userProfile.role === 'free' && (
            <div className="pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Upgrade to Pro to unlock all features!</p>
                <a href="/#pricing" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    View Plans
                </a>
            </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
