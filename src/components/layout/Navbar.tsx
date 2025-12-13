'use client';

import { LogOut, Settings, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { FIREBASE_STORAGE, getFirebaseStorageUrl } from '@/constants/links';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const { user, userProfile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const productsDropdownRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch by waiting for mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (
        productsDropdownRef.current &&
        !productsDropdownRef.current.contains(event.target as Node)
      ) {
        setProductsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Render placeholder for user section during SSR to prevent hydration mismatch
  const renderUserSection = () => {
    // Before mounting, show nothing to prevent hydration mismatch
    if (!mounted) {
      return <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />;
    }

    if (user) {
      return (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <span className="hidden text-sm font-medium text-gray-700 md:block dark:text-gray-200">
              {userProfile?.displayName || user.email?.split('@')[0] || 'User'}
              {(userProfile?.role === 'paid' || userProfile?.role === 'lifetime') && (
                <span className="ml-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                  {userProfile.role === 'lifetime' ? 'LIFETIME' : 'PRO'}
                </span>
              )}
            </span>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm dark:border-gray-700">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <User size={20} />
                </div>
              )}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 scale-100 transform rounded-xl bg-white py-1 opacity-100 shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 focus:outline-none dark:bg-gray-800">
              <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                  {user.email}
                </p>
              </div>

              {userProfile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="block flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings size={16} />
                  Admin Dashboard
                </Link>
              )}

              <Link
                href="/profile"
                className="block flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={16} />
                My Profile
              </Link>

              <button
                onClick={() => {
                  signOut();
                  setDropdownOpen(false);
                }}
                className="block flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-6 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/50"
        >
          Get Started
        </Link>
      </>
    );
  };

  return (
    <nav className="fixed left-4 right-4 top-4 z-50 rounded-2xl border border-white/20 bg-white/70 shadow-xl backdrop-blur-3xl transition-all duration-300 dark:bg-black/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center text-xl font-bold text-gray-700 transition-opacity hover:opacity-80 dark:text-white"
            >
              <Image
                src={getFirebaseStorageUrl(FIREBASE_STORAGE.LOGO)}
                alt="HDPick Logo"
                width={50}
                height={50}
                className="h-20 w-20"
                priority
              />
            </Link>
          </div>

          {/* Menu - Center */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 transform items-center sm:flex sm:space-x-8">
            <Link
              href="/custom-folders"
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-800/50"
            >
              Custom Folders
            </Link>

            <Link
              href="/photo-frame"
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-800/50"
            >
              Photo Frame
            </Link>

            <Link
              href="/blog"
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-800/50"
            >
              Blog
            </Link>
          </div>

          {/* User Section - Right */}
          <div className="flex items-center space-x-4">{renderUserSection()}</div>
        </div>
      </div>
    </nav>
  );
}
