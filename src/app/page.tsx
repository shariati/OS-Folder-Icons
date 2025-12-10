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

import { getDB } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Palette, Layers, ImageIcon } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { HeroSlider } from '@/components/features/HeroSlider';
import { StatsSection } from '@/components/features/StatsSection';
import { VideoBackground } from '@/components/features/VideoBackground';
import PricingSection from '@/components/subscription/PricingSection';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { FeaturedBlogs } from '@/components/features/FeaturedBlogs';
import { getFirebaseStorageUrl, FIREBASE_STORAGE } from '@/constants/links';

export default async function Home() {
  const db = await getDB();
  const latestBundles = db.bundles.slice(0, 8); // Taking first 8 as latest

  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900" suppressHydrationWarning>
      {/* Main Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <VideoBackground />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
           <div className="animate-fade-in-up animation-delay-100">
              <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase text-sm mb-4 block">
                Personalize every pixel
              </span>
           </div>
           <div className="animate-fade-in-up animation-delay-200">
              <span className="inline-block py-1 px-3 rounded-full bg-black/5 backdrop-blur-md border border-black/10 text-gray-900 text-sm font-medium mb-6">
                v3.0 is now live
              </span>
           </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 drop-shadow-sm animate-fade-in-up animation-delay-400">
            Custom OS Folder Icons
          </h1>
          <p className="mt-6 text-xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-600">
            Customize your folder icons for macOS, Windows, and Linux. Choose from our premium bundles or generate your own.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
            <Link
              href="/custom-folders"
              className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <Palette size={20} />
              Create Icons
            </Link>
            <Link
              href="/bundles"
              className="px-8 py-4 rounded-xl bg-black/5 backdrop-blur-md border border-black/10 text-gray-900 font-bold text-lg hover:bg-black/10 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Layers size={20} />
              Browse Bundles
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#e0e5ec] dark:from-gray-900 to-transparent z-20" />
      </section>

      {/* Stats Section */}
      <section className="relative z-30 -mt-20 mb-12">
        <StatsSection />
      </section>
      {/* CTA Section - Photo Frame */}
      <section id="photo-frame-cta" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-orange-500">
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Turn Your Memories Into Art
          </h2>
          <p className="text-xl text-pink-100 mb-12 max-w-2xl mx-auto">
            Create stunning photo frames and desktop widgets from your favorite photos. Perfect for personalizing your workspace.
          </p>
          <Link href="/photo-frame" className="inline-flex items-center px-10 py-5 text-xl font-bold rounded-2xl text-pink-600 bg-white hover:bg-pink-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            <ImageIcon className="w-6 h-6 mr-3" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">Find the perfect style for your specific needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gap-y-20">
            {db.categories.map((cat) => (
              <Link href={`/bundles?category=${cat.name.toLowerCase()}`} key={cat.id} className="group relative block">
                <div className={`h-64 rounded-[2.5rem] ${cat.color} shadow-xl transition-transform duration-300 group-hover:-translate-y-2 relative overflow-visible`}>
                   {/* 3D Pop-out Image */}
                   <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-4 z-10 drop-shadow-2xl">
                      {cat.imageUrl ? (
                        <Image src={cat.imageUrl} alt={cat.name} fill className="object-contain" sizes="(max-width: 768px) 192px, 192px" />
                      ) : (
                        // Fallback if no image
                        <div className="w-full h-full flex items-center justify-center">
                           <span className="text-6xl">📁</span>
                        </div>
                      )}
                   </div>

                   {/* Content */}
                   <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                      <p className="text-white/90 font-medium text-sm line-clamp-2">{cat.description}</p>
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Bundles Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Latest Arrivals</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">Freshly baked icons for your desktop.</p>
            </div>
            <Link href="/bundles" className="hidden md:flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors">
              View All Bundles <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {latestBundles.map((bundle) => (
              <NeumorphBox as={Link} key={bundle.id} href={`/bundles/${bundle.id}`} className="group hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-inner">
                   {bundle.previewImage ? (
                    <Image src={bundle.previewImage} alt={bundle.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">No Preview</div>
                  )}
                </div>
                <div className="px-3 pb-3">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-1">{bundle.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{bundle.icons.length} Icons</span>
                    <span className="flex items-center gap-1 text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-xs font-bold">
                      Free
                    </span>
                  </div>
                </div>
              </NeumorphBox>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <NeumorphBox as={Link} href="/bundles" className="inline-flex items-center px-8 py-4 hover:neu-pressed rounded-2xl text-base font-bold text-gray-700 dark:text-gray-200 transition-all">
              View All Bundles
            </NeumorphBox>
          </div>
        </div>
      </section>

      {/* CTA Section - Create Your Own */}
      <section id="create" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Can't find what you're looking for?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Use our powerful icon generator to create custom folder icons that match your exact style and preferences.
          </p>
          <Link href="/custom-folders" className="inline-flex items-center px-10 py-5 text-xl font-bold rounded-2xl text-blue-600 bg-white hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            <Palette className="w-6 h-6 mr-3" />
            Open Icon Generator
          </Link>
        </div>
      </section>

      {/* Featured Blog Posts */}
      <FeaturedBlogs count={3} />

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <PricingSection />
      </section>

      <Footer />
    </div>
  );
}
