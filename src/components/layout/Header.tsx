'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { user, userProfile } = useAuth();
  return (
    <header className="drop-shadow-1 dark:bg-boxdark sticky top-0 z-40 flex w-full bg-white dark:drop-shadow-none">
      <div className="shadow-2 flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="border-stroke dark:border-strokedark dark:bg-boxdark z-50 block rounded-sm border bg-white p-1.5 shadow-sm lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}

          <Link className="block flex-shrink-0 lg:hidden" href="/">
            <div className="bg-primary h-8 w-8 rounded-full"></div>
          </Link>
        </div>

        <div className="hidden sm:block"></div>

        <div className="2xsm:gap-7 flex items-center gap-3">
          <ul className="2xsm:gap-4 flex items-center gap-2">
            {/* <!-- Dark Mode Toggler --> */}
            {/* Add Dark Mode Toggler Here if needed */}
            {/* <!-- Dark Mode Toggler --> */}

            {/* <!-- Notification Menu Area --> */}
            {/* Add Notification Menu Here if needed */}
            {/* <!-- Notification Menu Area --> */}

            {/* <!-- Chat Notification Area --> */}
            {/* Add Chat Notification Here if needed */}
            {/* <!-- Chat Notification Area --> */}
          </ul>

          {/* <!-- User Area --> */}
          <div className="relative">
            <Link href="/" className="flex items-center gap-4">
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-medium text-black dark:text-white">
                  {userProfile?.displayName || user?.displayName || 'User'}
                </span>
                <span className="block text-xs capitalize">{userProfile?.role || 'User'}</span>
              </span>

              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {userProfile?.photoURL || user?.photoURL ? (
                  <img
                    src={userProfile?.photoURL || user?.photoURL || ''}
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-gray-500" />
                )}
              </span>
            </Link>
          </div>
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
