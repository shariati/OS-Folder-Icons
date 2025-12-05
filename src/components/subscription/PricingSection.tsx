'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Check } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PricingSection = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/admin/plans');
        const data = await res.json();
        if (Array.isArray(data)) {
            // Sort plans: Free first, then by price
            const sorted = data.filter(p => p.active).sort((a, b) => a.price - b.price);
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
      alert('Please log in to subscribe.');
      return;
    }

    setLoading(priceId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode,
          userId: user.uid,
          email: user.email,
          returnUrl: window.location.href,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (stripe) {
        const { error } = await (stripe as any).redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe redirect error:', error);
          alert(error.message);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout.');
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
    ...plans
  ];

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that fits your needs.
          </p>
          
          <div className="mt-6 flex justify-center">
            <div className="relative bg-gray-200 dark:bg-gray-700 p-1 rounded-lg inline-flex">
                <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        billingCycle === 'monthly' 
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        billingCycle === 'annual' 
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    Annual <span className="text-xs text-green-500 ml-1">-20%</span>
                </button>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {allPlans.filter(p => billingCycle === 'monthly' ? p.interval !== 'year' : p.interval !== 'month').map((plan) => {
             const isCurrentPlan = userProfile?.role === 'paid' && plan.type === 'subscription' && plan.price > 0 || userProfile?.role === 'lifetime' && plan.type === 'payment';
             const isFree = plan.price === 0;
             const isDisabled = isCurrentPlan || (userProfile?.role === 'lifetime' && plan.type !== 'payment') || (userProfile?.role === 'paid' && isFree);

             return (
            <div key={plan.id} className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 flex flex-col">
              <div className="p-6 flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${plan.price}</span>
                  {plan.interval !== 'one-time' && <span className="text-base font-medium text-gray-500 dark:text-gray-400"> /{plan.interval}</span>}
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-6 w-6 text-green-500" aria-hidden="true" />
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 rounded-b-lg bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => plan.stripePriceId && handleSubscribe(plan.stripePriceId, plan.type as 'subscription' | 'payment')}
                  disabled={isDisabled || loading === plan.stripePriceId}
                  className={`w-full block text-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm transition-colors ${
                    isDisabled
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {loading === plan.stripePriceId ? 'Processing...' : isCurrentPlan ? 'Current Plan' : plan.buttonText || (isFree ? 'Get Started' : 'Subscribe')}
                </button>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
