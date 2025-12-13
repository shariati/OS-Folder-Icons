// import db from '@/lib/db';
import { Check } from 'lucide-react';

import { getLifetimeUserCount } from '@/lib/db';

export async function LifetimeDeal() {
  const count = await getLifetimeUserCount();
  // const count = 0; // Temporary fix
  const remaining = 1000 - count;

  if (remaining <= 0) {
    return (
      <div className="rounded-2xl bg-gray-100 p-6 text-center opacity-75 dark:bg-gray-800">
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Lifetime Access</h3>
        <p className="font-medium text-red-500">Sold Out</p>
        <p className="mt-2 text-sm text-gray-500">Please subscribe to a monthly plan.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 p-8 text-white shadow-xl">
      <div className="absolute right-0 top-0 rounded-bl-xl bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900">
        LIMITED OFFER
      </div>

      <h3 className="mb-2 text-2xl font-bold">Lifetime Access</h3>
      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold">$59</span>
        <span className="text-purple-200">/ one-time</span>
      </div>

      <p className="mb-6 text-sm text-purple-100">
        Pay once, own it forever. Includes all Paid User features.
      </p>

      <ul className="mb-8 space-y-3">
        {[
          'Unlimited Folder Generation',
          '10 Favourite Lists',
          'Download Paid & Free Bundles',
          'No Ads',
          'Priority Support',
        ].map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              <Check size={12} />
            </div>
            {feature}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <button className="w-full rounded-xl bg-white px-6 py-3 font-bold text-purple-600 shadow-lg transition-colors hover:bg-purple-50">
          Get Lifetime Access
        </button>
        <p className="text-center text-xs text-purple-200">Only {remaining} spots left!</p>
      </div>
    </div>
  );
}
