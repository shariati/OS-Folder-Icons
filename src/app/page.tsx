/*
 * OS-Folder-Icons
 * Copyright (C) 2025 Amin Shariati
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { ArrowRight, ImageIcon, Layers, Palette } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { FeaturedBlogs } from '@/components/features/FeaturedBlogs';
import { HeroSlider } from '@/components/features/HeroSlider';
import { StatsSection } from '@/components/features/StatsSection';
import { VideoBackground } from '@/components/features/VideoBackground';
import { Footer } from '@/components/layout/Footer';
import PricingSection from '@/components/subscription/PricingSection';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { getDB } from '@/lib/db';

export default async function Home() {
  const db = await getDB();
  const latestBundles = db.bundles.slice(0, 8); // Taking first 8 as latest

  return (
    <div
      className="flex min-h-screen flex-col bg-[#e0e5ec] dark:bg-gray-900"
      suppressHydrationWarning
    >
      {/* Main Hero Section */}
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Video Background */}
        <VideoBackground />

        <div className="relative z-20 mx-auto max-w-4xl px-4 text-center">
          <div className="animate-fade-in-up animation-delay-100">
            <span className="mb-4 block text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Personalize every pixel
            </span>
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <span className="mb-6 inline-block rounded-full border border-black/10 bg-black/5 px-3 py-1 text-sm font-medium text-gray-900 backdrop-blur-md">
              v3.0 is now live
            </span>
          </div>
          <h1 className="animate-fade-in-up animation-delay-400 mb-6 text-5xl font-bold tracking-tight text-gray-900 drop-shadow-sm md:text-7xl">
            Custom OS Folder Icons
          </h1>
          <p className="animate-fade-in-up animation-delay-600 mx-auto mb-10 mt-6 max-w-2xl text-xl leading-relaxed text-gray-700">
            Customize your folder icons for macOS, Windows, and Linux. Choose from our premium
            bundles or generate your own.
          </p>
          <div className="animate-fade-in-up animation-delay-600 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/custom-folders"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105 hover:bg-blue-700"
            >
              <Palette size={20} />
              Create Icons
            </Link>
            <Link
              href="/bundles"
              className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-black/5 px-8 py-4 text-lg font-bold text-gray-900 backdrop-blur-md transition-all hover:scale-105 hover:bg-black/10"
            >
              <Layers size={20} />
              Browse Bundles
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 z-20 h-32 w-full bg-gradient-to-t from-[#e0e5ec] to-transparent dark:from-gray-900" />
      </section>

      {/* Stats Section */}
      <section className="relative z-30 -mt-20 mb-12">
        <StatsSection />
      </section>
      {/* CTA Section - Photo Frame */}
      <section id="photo-frame-cta" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-orange-500">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          ></div>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">
            Turn Your Memories Into Art
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-pink-100">
            Create stunning photo frames and desktop widgets from your favorite photos. Perfect for
            personalizing your workspace.
          </p>
          <Link
            href="/photo-frame"
            className="inline-flex items-center rounded-2xl bg-white px-10 py-5 text-xl font-bold text-pink-600 shadow-xl transition-all hover:-translate-y-1 hover:bg-pink-50 hover:shadow-2xl"
          >
            <ImageIcon className="mr-3 h-6 w-6" />
            Create Photo Frame
          </Link>
        </div>
      </section>
      {/* Featured Section (Hero Slider) */}
      <section className="relative z-30">
        <HeroSlider slides={db.heroSlides || []} />
      </section>

      {/* Categories Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-24 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl dark:text-white">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Find the perfect style for your specific needs.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 gap-y-20 md:grid-cols-3">
            {db.categories.map((cat) => (
              <Link
                href={`/bundles?category=${cat.name.toLowerCase()}`}
                key={cat.id}
                className="group relative block"
              >
                <div
                  className={`h-64 rounded-[2.5rem] ${cat.color} relative overflow-visible shadow-xl transition-transform duration-300 group-hover:-translate-y-2`}
                >
                  {/* 3D Pop-out Image */}
                  <div className="absolute -top-16 left-1/2 z-10 h-48 w-48 -translate-x-1/2 drop-shadow-2xl transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-110">
                    {cat.imageUrl ? (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 192px, 192px"
                      />
                    ) : (
                      // Fallback if no image
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-6xl">📁</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                    <h3 className="mb-2 text-2xl font-bold">{cat.name}</h3>
                    <p className="line-clamp-2 text-sm font-medium text-white/90">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Bundles Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl dark:text-white">
                Latest Arrivals
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Freshly baked icons for your desktop.
              </p>
            </div>
            <Link
              href="/bundles"
              className="hidden items-center font-bold text-blue-600 transition-colors hover:text-blue-700 md:flex"
            >
              View All Bundles <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {latestBundles.map((bundle) => (
              <NeumorphBox
                as={Link}
                key={bundle.id}
                href={`/bundles/${bundle.id}`}
                className="group transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl shadow-inner">
                  {bundle.previewImage ? (
                    <Image
                      src={bundle.previewImage}
                      alt={bundle.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400 dark:bg-gray-700">
                      No Preview
                    </div>
                  )}
                </div>
                <div className="px-3 pb-3">
                  <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-800 dark:text-white">
                    {bundle.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{bundle.icons.length} Icons</span>
                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-900/30">
                      Free
                    </span>
                  </div>
                </div>
              </NeumorphBox>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <NeumorphBox
              as={Link}
              href="/bundles"
              className="hover:neu-pressed inline-flex items-center rounded-2xl px-8 py-4 text-base font-bold text-gray-700 transition-all dark:text-gray-200"
            >
              View All Bundles
            </NeumorphBox>
          </div>
        </div>
      </section>

      {/* CTA Section - Create Your Own */}
      <section id="create" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          ></div>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">
            Can't find what you're looking for?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-blue-100">
            Use our powerful icon generator to create custom folder icons that match your exact
            style and preferences.
          </p>
          <Link
            href="/custom-folders"
            className="inline-flex items-center rounded-2xl bg-white px-10 py-5 text-xl font-bold text-blue-600 shadow-xl transition-all hover:-translate-y-1 hover:bg-blue-50 hover:shadow-2xl"
          >
            <Palette className="mr-3 h-6 w-6" />
            Open Icon Generator
          </Link>
        </div>
      </section>

      {/* Featured Blog Posts */}
      <FeaturedBlogs count={3} />

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-24 dark:bg-gray-900/50">
        <PricingSection />
      </section>

      <Footer />
    </div>
  );
}
