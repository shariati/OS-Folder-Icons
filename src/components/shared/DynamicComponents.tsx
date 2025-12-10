'use client';

import dynamic from 'next/dynamic';

/**
 * Dynamic Component Wrappers
 *
 * These wrappers enable code-splitting for heavy components,
 * reducing initial JavaScript bundle size and improving LCP.
 */

// Loading placeholder component
const LoadingPlaceholder = ({ className = 'h-64' }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 ${className}`} />
);

// Heavy admin components - only load when needed
export const DynamicRichTextEditor = dynamic(
  () =>
    import('@/components/admin/RichTextEditor').then((mod) => ({ default: mod.RichTextEditor })),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder className="h-64" />,
  }
);

export const DynamicIconPicker = dynamic(
  () => import('@/components/features/IconPicker').then((mod) => ({ default: mod.IconPicker })),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder className="h-32" />,
  }
);

export const DynamicPhotoFrameGenerator = dynamic(
  () =>
    import('@/components/features/PhotoFrameGenerator').then((mod) => ({
      default: mod.PhotoFrameGenerator,
    })),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder className="h-96" />,
  }
);

export const DynamicIconGenerator = dynamic(
  () =>
    import('@/components/features/IconGenerator').then((mod) => ({ default: mod.IconGenerator })),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder className="h-96" />,
  }
);

// Hero slider with framer-motion - defer loading
export const DynamicHeroSlider = dynamic(
  () => import('@/components/features/HeroSlider').then((mod) => ({ default: mod.HeroSlider })),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder className="h-screen" />,
  }
);

// Subscription components - can be deferred on homepage
export const DynamicPricingSection = dynamic(
  () => import('@/components/subscription/PricingSection'),
  {
    loading: () => <LoadingPlaceholder className="h-96" />,
  }
);

// Bundle viewer with heavy icon imports
export const DynamicBundleViewer = dynamic(
  () => import('@/components/features/BundleViewer').then((mod) => ({ default: mod.BundleViewer })),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder className="h-96" />,
  }
);
