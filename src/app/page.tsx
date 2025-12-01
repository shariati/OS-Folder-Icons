import { getDB } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Download, Palette, Gamepad2, Briefcase, GraduationCap, Code2, Paintbrush, Coins, Sparkles } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { clsx } from 'clsx';

export default async function Home() {
  const db = await getDB();
  const featuredBundles = db.bundles.slice(0, 3); // Just taking first 3 as featured for now
  const latestBundles = db.bundles.slice(0, 8); // Taking first 8 as latest

  const categories = [
    { name: 'Gaming', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { name: 'Finance', icon: Coins, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { name: 'Office', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { name: 'School', icon: GraduationCap, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { name: 'Coding', icon: Code2, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    { name: 'Art', icon: Paintbrush, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#e0e5ec] dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full neu-pressed mb-8 text-sm font-medium text-blue-600 dark:text-blue-400">
            <Sparkles size={16} />
            <span>Premium Folder Icons for Everyone</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-800 dark:text-white mb-8 leading-tight">
            Transform Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Digital Workspace
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 mb-12">
            Elevate your folder icons with our premium, handcrafted collections. 
            Designed for macOS, Windows, and Linux.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/bundles" className="px-8 py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all">
              Explore Bundles
            </Link>
            <Link href="/create" className="px-8 py-4 text-lg font-bold rounded-2xl text-gray-700 dark:text-gray-200 neu-flat hover:neu-pressed transition-all flex items-center justify-center gap-2">
              <Palette size={20} />
              Create Custom
            </Link>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>
      </section>

      {/* Featured Bundles (Hero Extension) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Featured Collections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredBundles.map((bundle) => (
              <Link key={bundle.id} href={`/bundles/${bundle.id}`} className="group block">
                <div className="neu-flat p-4 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-inner">
                    {bundle.previewImage ? (
                      <Image src={bundle.previewImage} alt={bundle.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <Palette className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <span className="text-white font-bold flex items-center gap-2">
                        View Collection <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="px-2 pb-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">{bundle.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{bundle.icons.length} Icons</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">Find the perfect style for your specific needs.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link href={`/bundles?category=${cat.name.toLowerCase()}`} key={cat.name} className="group flex flex-col items-center p-6 rounded-3xl neu-flat hover:neu-pressed transition-all duration-200">
                <div className={`w-16 h-16 rounded-2xl ${cat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                  <cat.icon className={`w-8 h-8 ${cat.color}`} />
                </div>
                <span className="font-bold text-gray-700 dark:text-white">{cat.name}</span>
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
              <Link key={bundle.id} href={`/bundles/${bundle.id}`} className="group neu-flat p-3 rounded-3xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-inner">
                   {bundle.previewImage ? (
                    <Image src={bundle.previewImage} alt={bundle.name} fill className="object-cover" />
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
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/bundles" className="inline-flex items-center px-8 py-4 neu-flat hover:neu-pressed rounded-2xl text-base font-bold text-gray-700 dark:text-gray-200 transition-all">
              View All Bundles
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Create Your Own */}
      <section id="create" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
           <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Can't find what you're looking for?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Use our powerful icon generator to create custom folder icons that match your exact style and preferences.
          </p>
          <Link href="/create" className="inline-flex items-center px-10 py-5 text-xl font-bold rounded-2xl text-blue-600 bg-white hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            <Palette className="w-6 h-6 mr-3" />
            Open Icon Generator
          </Link>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-24 bg-gray-800 dark:bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-gray-400 mb-10 text-lg">
            Subscribe to our newsletter to get notified about new bundle releases and exclusive design tips.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-4 rounded-2xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              required
            />
            <button type="submit" className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold transition-all shadow-lg hover:shadow-blue-500/30">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
