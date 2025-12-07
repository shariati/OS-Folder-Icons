'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderOpen, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { user, userProfile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const productsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
        setProductsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 rounded-2xl border border-white/20 bg-white/70 dark:bg-black/70 backdrop-blur-3xl shadow-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-700 dark:text-white hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <span className="hidden sm:block">HDPick</span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8 items-center">
              {/* Custom Folders Dropdown */}
              <div className="relative" ref={productsDropdownRef}>
                <button
                  onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                  className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all gap-1 outline-none"
                >
                  Custom Folders
                  <ChevronDown size={16} className={`transition-transform duration-200 ${productsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {productsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 py-1 focus:outline-none transform opacity-100 scale-100 transition-all duration-200">
                    <Link
                      href="/bundles"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProductsDropdownOpen(false)}
                    >
                      Bundles
                    </Link>
                    <Link
                      href="/create"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProductsDropdownOpen(false)}
                    >
                      Custom Folders
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/photo-frame" className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all">
                Photo Frame
              </Link>
              
              <Link href="/blog" className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all">
                Blog
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {userProfile?.displayName || user.email?.split('@')[0] || 'User'}
                    {(userProfile?.role === 'paid' || userProfile?.role === 'lifetime') && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">
                            {userProfile.role === 'lifetime' ? 'LIFETIME' : 'PRO'}
                        </span>
                    )}
                  </span>
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                        <User size={20} />
                      </div>
                    )}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 py-1 focus:outline-none transform opacity-100 scale-100 transition-all duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
                    </div>
                    
                    {userProfile?.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings size={16} />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
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
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium rounded-xl text-white bg-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
