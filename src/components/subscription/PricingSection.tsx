'use client';

import { Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';

const PricingSection = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const { showToast } = useToast();

  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Prevent hydration mismatch by waiting for mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/admin/plans');
        const data = await res.json();
        if (Array.isArray(data)) {
          // Sort plans: Free first, then by price
          const sorted = data
            .filter((p) => {
              if (!p.active) return false;
              // Hide sold out lifetime plans
              if (p.maxQuantity && (p.soldCount || 0) >= p.maxQuantity) return false;
              return true;
            })
            .sort((a, b) => a.price - b.price);
          setPlans(sorted);
        }
      } catch (error) {
        console.error('Failed to fetch plans', error);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (priceId: string, mode: 'subscription' | 'payment') => {
    if (!user) {
      // Redirect to login or show login modal
      showToast('Please log in to subscribe.', 'info');
      return;
    }

    setLoading(priceId);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          priceId,
          mode,
          returnUrl: window.location.href,
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showToast('Failed to start checkout.', 'error');
    } finally {
      setLoading(null);
    }
  };

  if (loadingPlans) {
    return <div className="py-12 text-center">Loading plans...</div>;
  }

  // Add Free Plan manually if not in DB or just as a base
  const allPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      currency: 'USD',
      interval: 'month',
      description: 'Perfect for getting started',
      features: [
        'Download Free bundles',
        'Custom Folders (Simple mode)',
        'Download with Ads',
        'Photo Frame (with Ads)',
      ],
      buttonText: 'Current Plan',
      disabled: true,
      type: 'subscription',
      active: true,
    },
    ...plans,
  ];

  return (
    <div className="bg-gray-50 py-12 dark:bg-gray-900" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-white">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that fits your needs.
          </p>

          <div className="mt-6 flex justify-center">
            <div className="relative inline-flex rounded-lg bg-gray-200 p-1 dark:bg-gray-700">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Annual <span className="ml-1 text-xs text-green-500">-20%</span>
              </button>
            </div>
          </div>

          {/* CO2 Contribution Banner */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
              <span>🌱</span>
              <span>0.5% of your purchase goes toward removing CO₂ from the atmosphere</span>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-3">
          {allPlans
            .filter((p) =>
              billingCycle === 'monthly' ? p.interval !== 'year' : p.interval !== 'month'
            )
            .map((plan) => {
              const isCurrentPlan =
                (userProfile?.role === 'paid' && plan.type === 'subscription' && plan.price > 0) ||
                (userProfile?.role === 'lifetime' && plan.type === 'payment');
              const isFree = plan.price === 0;
              const isDisabled =
                isCurrentPlan ||
                (userProfile?.role === 'lifetime' && plan.type !== 'payment') ||
                (userProfile?.role === 'paid' && isFree);

              return (
                <div
                  key={plan.id}
                  className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex-1 p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      {plan.description}
                    </p>
                    <p className="mt-8">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      {plan.interval !== 'one-time' && (
                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                          {' '}
                          /{plan.interval}
                        </span>
                      )}
                    </p>
                    <ul className="mt-6 space-y-4">
                      {plan.features.map((feature: string) => (
                        <li key={feature} className="flex items-start">
                          <div className="flex-shrink-0">
                            <Check className="h-6 w-6 text-green-500" aria-hidden="true" />
                          </div>
                          <p className="ml-3 text-base text-gray-500 dark:text-gray-400">
                            {feature}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-b-lg bg-gray-50 p-6 dark:bg-gray-900/50">
                    <button
                      onClick={() =>
                        plan.stripePriceId &&
                        handleSubscribe(plan.stripePriceId, plan.type as 'subscription' | 'payment')
                      }
                      disabled={isDisabled || loading === plan.stripePriceId}
                      className={`block w-full rounded-md border border-transparent px-6 py-3 text-center text-base font-medium text-white shadow-sm transition-colors ${
                        isDisabled
                          ? 'cursor-not-allowed bg-gray-400'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {loading === plan.stripePriceId
                        ? 'Processing...'
                        : isCurrentPlan
                          ? 'Current Plan'
                          : plan.buttonText || (isFree ? 'Get Started' : 'Subscribe')}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
