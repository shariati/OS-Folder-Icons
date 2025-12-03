// import db from '@/lib/db';
import { Check } from 'lucide-react';

export async function LifetimeDeal() {
  // const count = await db.getLifetimeUserCount();
  const count = 0; // Temporary fix
  const remaining = 1000 - count;

  if (remaining <= 0) {
    return (
      <div className="p-6 rounded-2xl bg-gray-100 dark:bg-gray-800 text-center opacity-75">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Lifetime Access</h3>
        <p className="text-red-500 font-medium">Sold Out</p>
        <p className="text-sm text-gray-500 mt-2">Please subscribe to a monthly plan.</p>
      </div>
    );
  }

  return (
    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-xl overflow-hidden">
      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
        LIMITED OFFER
      </div>
      
      <h3 className="text-2xl font-bold mb-2">Lifetime Access</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-extrabold">$59</span>
        <span className="text-purple-200">/ one-time</span>
      </div>
      
      <p className="text-purple-100 mb-6 text-sm">
        Pay once, own it forever. Includes all Paid User features.
      </p>

      <ul className="space-y-3 mb-8">
        {[
          'Unlimited Folder Generation',
          '10 Favourite Lists',
          'Download Paid & Free Bundles',
          'No Ads',
          'Priority Support'
        ].map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Check size={12} />
            </div>
            {feature}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <button className="w-full py-3 px-6 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-lg">
          Get Lifetime Access
        </button>
        <p className="text-center text-xs text-purple-200">
          Only {remaining} spots left!
        </p>
      </div>
    </div>
  );
}
