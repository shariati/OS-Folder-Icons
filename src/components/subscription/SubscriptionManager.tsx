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

import { FileText, Download, CreditCard, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/constants/locale';

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
                    'Authorization': `Bearer ${idToken}`,
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
                    'Authorization': `Bearer ${idToken}`,
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
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-white/20 overflow-hidden">
            {/* Header & Tabs */}
            <div className="p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Subscription Management</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your plan and billing details</p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                        <button
                            onClick={handleSyncSubscription}
                            disabled={loading}
                            title="Force Refresh Data"
                            className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <p className="text-[10px] text-gray-400 mt-1 text-right max-w-[180px] leading-tight">
                            Subscription updates automatically. <br/> Use this only if data seems outdated.
                        </p>
                    </div>
                </div>

                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('subscription')}
                        className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'subscription'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
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
                                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                                        userProfile.role === 'lifetime' ? 'bg-purple-500' :
                                        userProfile.cancelAtPeriodEnd ? 'bg-amber-500' :
                                        userProfile.subscriptionStatus === 'active' ? 'bg-green-500' :
                                        'bg-gray-400'
                                    }`}></span>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                        {userProfile.role === 'lifetime' ? 'Lifetime Active' :
                                         userProfile.cancelAtPeriodEnd ? 'Cancels Soon' :
                                         userProfile.subscriptionStatus || 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {userProfile.role === 'lifetime' && (
                            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-amber-50 dark:from-purple-900/20 dark:to-amber-900/20 border border-purple-200 dark:border-purple-800/50">
                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex-shrink-0">
                                        <img 
                                            src="/lifetime-gift-card.png" 
                                            alt="Thank you gift card" 
                                            className="w-48 h-auto rounded-lg shadow-lg"
                                        />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-amber-600 dark:from-purple-400 dark:to-amber-400 mb-2">
                                            Thank You for Your Lifetime Support! 🎉
                                        </h4>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            As a valued lifetime member, you have <strong>permanent access</strong> to all premium features including Custom Folders and Photo Frames. 
                                            Your support helps keep this project running, and we're committed to providing you with these features for as long as the site is up and running.
                                        </p>
                                        <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-medium">
                                            You're part of an exclusive group of supporters who believe in this project! 💜
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(userProfile.currentPeriodEnd || userProfile.role === 'lifetime') && (
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-1">
                                        {userProfile.role === 'lifetime' ? 'Access Duration' :
                                         userProfile.cancelAtPeriodEnd ? 'Access Ends' : 'Next Cycle'}
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
                             {/* Manage Billing moved to invoices tab generally, but can keep basic or just Upgrade buttons here */}
                            {userProfile.role === 'paid' && !userProfile.cancelAtPeriodEnd && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    disabled={loading}
                                    className="inline-flex items-center px-6 py-3 border border-red-200 dark:border-red-900/50 text-base font-medium rounded-xl shadow-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-50"
                                >
                                    Cancel Subscription
                                </button>
                            )}

                            {userProfile.role === 'free' && (
                                <a href="/#pricing" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5">
                                    Upgrade to Pro
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    // Invoices Tab
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">Payment Method & Settings</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Update cards and billing information via Stripe</p>
                            </div>
                            <button
                                onClick={handleManageSubscription}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                <CreditCard size={16} />
                                Manage in Stripe
                            </button>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                PDF invoices are only available for subscription payments. One-time payments (like lifetime purchases) don't generate PDF invoices.
                            </p>
                            {invoicesLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading transactions...</div>
                            ) : invoices.length > 0 ? (
                                <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                            <tr>
                                                <th className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">Date</th>
                                                <th className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">Amount</th>
                                                <th className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">Status</th>
                                                <th className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200 text-right">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {invoices.map((inv) => (
                                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                        {formatDate(inv.date, 'LONG')}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                                                        {(inv.amount / 100).toLocaleString('en-US', { style: 'currency', currency: inv.currency.toUpperCase() })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            inv.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {inv.pdf_url && (
                                                            <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
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
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">No invoices found</p>
                                </div>
                            )}
                        </div>
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
