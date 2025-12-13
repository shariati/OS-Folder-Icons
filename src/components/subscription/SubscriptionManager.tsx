'use client';

import React, { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { CancellationModal } from './CancellationModal';

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
    let months =
      (endDate.getFullYear() - now.getFullYear()) * 12 + (endDate.getMonth() - now.getMonth());
    // Adjust if the day of month hasn't been reached yet in the target month
    if (endDate.getDate() < now.getDate()) {
      months--;
    }

    // if value is 1 month and below then show in days but if it is above 1 month then show in months
    if (months > 1) {
      return { value: months, unit: 'Months', percent: Math.min(100, (months / 12) * 100) };
    }

    // Otherwise show days
    return {
      value: Math.max(0, totalDays),
      unit: 'Days',
      percent: Math.min(100, (totalDays / 30) * 100),
    };
  };

  const { value, unit, percent } = calculateTimeLeft();
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-16 w-16 -rotate-90 transform">
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
          className="text-blue-600 transition-all duration-1000 ease-out dark:text-blue-400"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold leading-none text-gray-900 dark:text-white">
          {value}
        </span>
        <span className="text-[10px] leading-none text-gray-500 dark:text-gray-400">{unit}</span>
      </div>
    </div>
  );
};

import { CreditCard, Download, FileText, RefreshCw } from 'lucide-react';

import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/format';

const SubscriptionManagerContent = () => {
  const { user, userProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscription' | 'invoices'>('subscription');
  const [invoices, setInvoices] = useState<any[]>([]);

  const handleSyncSubscription = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/stripe/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        showToast('Subscription status synced successfully!', 'success');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showToast('Failed to sync: ' + (data.message || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error syncing subscription:', error);
      showToast('An error occurred while syncing.', 'error');
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
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        showToast('Failed to redirect to subscription portal.', 'error');
      }
    } catch (error) {
      console.error('Error accessing portal:', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    if (!user) return;
    setInvoicesLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/stripe/invoices', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      if (data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setInvoicesLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'invoices' && invoices.length === 0) {
      fetchInvoices();
    }
  }, [activeTab]);

  if (!userProfile) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/20 bg-white shadow-xl dark:bg-gray-800">
      {/* Header & Tabs */}
      <div className="p-8 pb-0">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Subscription Management
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your plan and billing details
            </p>
          </div>

          <div className="flex flex-col items-end">
            <button
              onClick={handleSyncSubscription}
              disabled={loading}
              title="Force Refresh Data"
              className="rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-blue-600 disabled:opacity-50 dark:text-gray-500 dark:hover:bg-gray-700/50 dark:hover:text-blue-400"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <p className="mt-1 max-w-[180px] text-right text-[10px] leading-tight text-gray-400">
              Subscription updates automatically. <br /> Use this only if data seems outdated.
            </p>
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'subscription'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Billing & Invoices
          </button>
        </div>
      </div>

      <div className="p-8">
        {activeTab === 'subscription' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/30">
                <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Plan
                </p>
                <p className="text-xl font-bold capitalize text-gray-900 dark:text-white">
                  {userProfile.role === 'paid'
                    ? 'Pro'
                    : userProfile.role === 'lifetime'
                      ? 'Lifetime'
                      : 'Starter (Free)'}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/30">
                <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      userProfile.role === 'lifetime'
                        ? 'bg-purple-500'
                        : userProfile.cancelAtPeriodEnd
                          ? 'bg-amber-500'
                          : userProfile.subscriptionStatus === 'active'
                            ? 'bg-green-500'
                            : 'bg-gray-400'
                    }`}
                  ></span>
                  <p className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                    {userProfile.role === 'lifetime'
                      ? 'Lifetime Active'
                      : userProfile.cancelAtPeriodEnd
                        ? 'Cancels Soon'
                        : userProfile.subscriptionStatus || 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {userProfile.role === 'lifetime' && (
              <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-amber-50 p-6 dark:border-purple-800/50 dark:from-purple-900/20 dark:to-amber-900/20">
                <div className="flex flex-col items-center gap-6 md:flex-row">
                  <div className="flex-shrink-0">
                    <img
                      src="/lifetime-gift-card.png"
                      alt="Thank you gift card"
                      className="h-auto w-48 rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="mb-2 bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-xl font-bold text-transparent dark:from-purple-400 dark:to-amber-400">
                      Thank You for Your Lifetime Support! 🎉
                    </h4>
                    <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                      As a valued lifetime member, you have <strong>permanent access</strong> to all
                      premium features including Custom Folders and Photo Frames. Your support helps
                      keep this project running, and we're committed to providing you with these
                      features for as long as the site is up and running.
                    </p>
                    <p className="mt-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                      You're part of an exclusive group of supporters who believe in this project!
                      💜
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(userProfile.currentPeriodEnd || userProfile.role === 'lifetime') && (
              <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-900/20">
                <div>
                  <p className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-300">
                    {userProfile.role === 'lifetime'
                      ? 'Access Duration'
                      : userProfile.cancelAtPeriodEnd
                        ? 'Access Ends'
                        : 'Next Cycle'}
                  </p>
                  {userProfile.role === 'lifetime' ? (
                    <p className="text-base font-semibold text-blue-900 dark:text-blue-100">
                      Permanent Access
                    </p>
                  ) : (
                    <p className="text-base font-semibold text-blue-900 dark:text-blue-100">
                      {formatDate(userProfile.currentPeriodEnd, 'LONG')}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {userProfile.role === 'lifetime' ? (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      LIFETIME
                    </span>
                  ) : (
                    <RenewalProgress end={userProfile.currentPeriodEnd!} />
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              {/* Manage Billing moved to invoices tab generally, but can keep basic or just Upgrade buttons here */}
              {userProfile.role === 'paid' && !userProfile.cancelAtPeriodEnd && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={loading}
                  className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-base font-medium text-red-600 shadow-sm transition-all hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  Cancel Subscription
                </button>
              )}

              {userProfile.role === 'free' && (
                <a
                  href="/#pricing"
                  className="inline-flex transform items-center rounded-xl border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Upgrade to Pro
                </a>
              )}
            </div>
          </div>
        ) : (
          // Invoices Tab
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-700/30">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Payment Method & Settings
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update cards and billing information via Stripe
                </p>
              </div>
              <button
                onClick={handleManageSubscription}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <CreditCard size={16} />
                Manage in Stripe
              </button>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
                Transaction History
              </h4>
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                PDF invoices are only available for subscription payments. One-time payments (like
                lifetime purchases) don't generate PDF invoices.
              </p>
              {invoicesLoading ? (
                <div className="py-8 text-center text-gray-500">Loading transactions...</div>
              ) : invoices.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                          Date
                        </th>
                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                          Amount
                        </th>
                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right font-medium text-gray-900 dark:text-gray-200">
                          Invoice
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {invoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                            {formatDate(inv.date, 'LONG')}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {(inv.amount / 100).toLocaleString('en-US', {
                              style: 'currency',
                              currency: inv.currency.toUpperCase(),
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                inv.status === 'paid'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {inv.pdf_url && (
                              <a
                                href={inv.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                              >
                                <Download size={14} />
                                <span className="hidden sm:inline">PDF</span>
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 py-12 text-center dark:bg-gray-800/50">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p className="font-medium text-gray-500 dark:text-gray-400">No invoices found</p>
                </div>
              )}
            </div>

            {/* CO2 Contribution Summary */}
            {invoices.length > 0 && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-800/50">
                    <span className="text-lg">🌱</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Your CO₂ Removal Contribution
                    </p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      $
                      {(
                        (invoices
                          .filter((inv: any) => inv.status === 'paid')
                          .reduce((sum: number, inv: any) => sum + inv.amount, 0) /
                          100) *
                        0.005
                      ).toFixed(2)}{' '}
                      USD
                    </p>
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                      0.5% of your payments help remove CO₂ from the atmosphere
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSuccess={() => {
          showToast('Subscription cancelled successfully.', 'success');
          setTimeout(() => window.location.reload(), 2000);
        }}
      />
    </div>
  );
};

export default SubscriptionManager;
