'use client';

import React from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface PlanProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
  buttonText: string;
  buttonLink: string;
  onSelect?: () => void;
}

const PlanCard: React.FC<PlanProps> = ({ name, price, description, features, recommended, buttonText, buttonLink, onSelect }) => {
  return (
    <div className={`relative flex flex-col p-8 bg-white dark:bg-gray-800 rounded-3xl border ${recommended ? 'border-blue-500 shadow-2xl shadow-blue-500/20' : 'border-gray-200 dark:border-gray-700 shadow-xl'} transition-all duration-300 hover:-translate-y-2`}>
      {recommended && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-bold rounded-full shadow-lg">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
      </div>
      <div className="mb-8">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">{price}</span>
        {price !== 'Free' && <span className="text-gray-500 dark:text-gray-400">/month</span>}
      </div>
      <ul className="flex-1 space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5 mr-3">
              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      {onSelect ? (
        <button
          onClick={onSelect}
          className={`w-full py-4 rounded-xl font-bold transition-all ${
            recommended
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {buttonText}
        </button>
      ) : (
        <Link
          href={buttonLink}
          className={`w-full py-4 rounded-xl font-bold text-center transition-all ${
            recommended
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
};

export function SubscriptionPlans({ onSelectPlan }: { onSelectPlan?: (plan: string) => void }) {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for personal use and trying out the basics.',
      features: [
        'Access to 50+ Free Icons',
        'Basic Icon Customization',
        'Download in PNG format',
        'Personal License'
      ],
      buttonText: 'Get Started',
      buttonLink: '/signup?plan=free',
      id: 'free'
    },
    {
      name: 'Pro',
      price: '$9',
      description: 'Unlock full potential with premium icons and advanced tools.',
      features: [
        'Access to All 500+ Icons',
        'Advanced Customization Tools',
        'Download in ICNS, ICO, PNG',
        'Priority Support',
        'Commercial License',
        'Request Custom Icons'
      ],
      recommended: true,
      buttonText: 'Start Pro Trial',
      buttonLink: '/signup?plan=pro',
      id: 'pro'
    },
    {
      name: 'Lifetime',
      price: '$49',
      description: 'One-time payment for lifetime access to everything.',
      features: [
        'Everything in Pro',
        'Lifetime Updates',
        'No Recurring Fees',
        'Exclusive "Supporter" Badge',
        'Early Access to New Features'
      ],
      buttonText: 'Get Lifetime',
      buttonLink: '/signup?plan=lifetime',
      id: 'lifetime'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {plans.map((plan) => (
        <PlanCard
          key={plan.name}
          {...plan}
          onSelect={onSelectPlan ? () => onSelectPlan(plan.id) : undefined}
        />
      ))}
    </div>
  );
}
