'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionManager = () => {
  return <SubscriptionManagerContent />;
};

const RenewalProgress = ({ end }: { end: string }) => {
    const calculateTimeLeft = () => {
        const now = new Date();
        const endDate = new Date(end);
        
        // Calculate total difference in milliseconds first
        const diffTime = endDate.getTime() - now.getTime();
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate exact month difference
        let months = (endDate.getFullYear() - now.getFullYear()) * 12 + (endDate.getMonth() - now.getMonth());
        // Adjust if the day of month hasn't been reached yet in the target month
        if (endDate.getDate() < now.getDate()) {
            months--;
        }

        // if value is 1 month and below then show in days but if it is above 1 month then show in months
        if (months > 1) {
            return { value: months, unit: 'Months', percent: Math.min(100, (months / 12) * 100) };
        }
        
        // Otherwise show days
        return { value: Math.max(0, totalDays), unit: 'Days', percent: Math.min(100, (totalDays / 30) * 100) };
    };

    const { value, unit, percent } = calculateTimeLeft();
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg className="transform -rotate-90 w-16 h-16">
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-blue-200 dark:text-blue-900"
                />
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-blue-600 dark:text-blue-400 transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{value}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">{unit}</span>
            </div>
        </div>
    );
};

const SubscriptionManagerContent = () => {
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

        {(userProfile.currentPeriodEnd || userProfile.role === 'lifetime') && (
             <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-1">
                        {userProfile.role === 'lifetime' ? 'Access Duration' : 'Next Cycle'}
                    </p>
                    {userProfile.role === 'lifetime' ? (
                        <p className="text-base font-semibold text-blue-900 dark:text-blue-100">
                            Permanent Access
                        </p>
                    ) : (
                        <p className="text-base font-semibold text-blue-900 dark:text-blue-100">
                            {new Date(userProfile.currentPeriodEnd!).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </p>
                    )}
                </div>

                <div className="flex-shrink-0">
                    {userProfile.role === 'lifetime' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">
                            LIFETIME
                        </span>
                    ) : (
                        <RenewalProgress end={userProfile.currentPeriodEnd!} />
                    )}
                </div>
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
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mb-4">
                    View your payment history and download invoices in the billing portal.
                </p>
                <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Support ID (Stripe Customer ID)</p>
                    <code className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 select-all">
                        {userProfile.stripeCustomerId}
                    </code>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
                        Please provide this ID when contacting support regarding any payment or subscription issues.
                    </p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
