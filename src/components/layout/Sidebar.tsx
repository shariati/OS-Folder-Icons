'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Grid, Tags, Image as ImageIcon, ArrowLeft, FolderOpen, Users, BarChart2, Activity, FileText, Layout, ChevronDown, Globe, Layers, PenTool, Banknote, Settings } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: 'os' | 'bundles' | 'categories' | 'tags' | 'hero' | 'users' | 'blog' | 'pages' | 'ads' | 'settings') => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }: SidebarProps) => {
  const pathname = usePathname();
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const [isFolderIconOpen, setIsFolderIconOpen] = useState(true);
  const [isSiteManagerOpen, setIsSiteManagerOpen] = useState(true);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <aside
      ref={sidebar}
      className={clsx(
        "absolute left-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
             <FolderOpen className="h-6 w-6" />
          </div>
          Admin
        </Link>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2 uppercase text-gray-400">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              
              {/* Folder Icon Group */}
              <li>
                <button
                  onClick={() => setIsFolderIconOpen(!isFolderIconOpen)}
                  className="group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderOpen className="h-5 w-5" />
                    Folder Icon
                  </div>
                  <ChevronDown className={clsx("h-4 w-4 transition-transform", !isFolderIconOpen && "-rotate-90")} />
                </button>
                {/* Sub Menu */}
                <div className={clsx("overflow-hidden transition-all duration-300", isFolderIconOpen ? "max-h-40 mt-2" : "max-h-0")}>
                  <ul className="flex flex-col gap-1.5 pl-9">
                    <li>
                      <button
                        onClick={() => { setActiveTab('os'); setSidebarOpen(false); }}
                        className={clsx(
                          "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left text-sm",
                          activeTab === 'os' && "text-white"
                        )}
                      >
                        Operating Systems
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => { setActiveTab('bundles'); setSidebarOpen(false); }}
                        className={clsx(
                          "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left text-sm",
                          activeTab === 'bundles' && "text-white"
                        )}
                      >
                        Bundle Management
                      </button>
                    </li>
                  </ul>
                </div>
              </li>

              {/* Site Manager Group */}
              <li>
                <button
                  onClick={() => setIsSiteManagerOpen(!isSiteManagerOpen)}
                  className="group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left justify-between mt-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="h-5 w-5" />
                    Site Manager
                  </div>
                  <ChevronDown className={clsx("h-4 w-4 transition-transform", !isSiteManagerOpen && "-rotate-90")} />
                </button>
                {/* Sub Menu */}
                <div className={clsx("overflow-hidden transition-all duration-300", isSiteManagerOpen ? "max-h-[500px] mt-2" : "max-h-0")}>
                  <ul className="flex flex-col gap-1.5 pl-9">
                    <li>
                      <button
                        onClick={() => { setActiveTab('blog'); setSidebarOpen(false); }}
                        className={clsx(
                          "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left text-sm",
                          activeTab === 'blog' && "text-white"
                        )}
                      >
                        Blog Posts
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => { setActiveTab('pages'); setSidebarOpen(false); }}
                        className={clsx(
                          "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left text-sm",
                          activeTab === 'pages' && "text-white"
                        )}
                      >
                        Pages
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => { setActiveTab('categories'); setSidebarOpen(false); }}
                        className={clsx(
                          "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left text-sm",
                          activeTab === 'categories' && "text-white"
                        )}
                      >
                        Categories
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => { setActiveTab('tags'); setSidebarOpen(false); }}
                        className={clsx(
                          "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left text-sm",
                          activeTab === 'tags' && "text-white"
                        )}
                      >
                        Tags
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => { setActiveTab('hero'); setSidebarOpen(false); }}
                        className={clsx(
                          "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left text-sm",
                          activeTab === 'hero' && "text-white"
                        )}
                      >
                        Hero Slides
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
                        className={clsx(
                          "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left text-sm",
                          activeTab === 'settings' && "text-white"
                        )}
                      >
                        Site Configuration
                      </button>
                    </li>
                  </ul>
                </div>
              </li>

              {/* Divider */}
              <li>
                <div className="h-px bg-gray-700 my-4 mx-4"></div>
              </li>

              {/* Other Items */}
              <li>
                <button
                  onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
                  className={clsx(
                    "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left",
                    activeTab === 'users' && "bg-graydark dark:bg-meta-4 text-white"
                  )}
                >
                  <Users className="h-5 w-5" />
                  Users
                </button>
              </li>


              <li>
                <button
                  onClick={() => { setActiveTab('ads'); setSidebarOpen(false); }}
                  className={clsx(
                    "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 w-full text-left",
                    activeTab === 'ads' && "bg-graydark dark:bg-meta-4 text-white"
                  )}
                >
                  <Banknote className="h-5 w-5" />
                  Monetization
                </button>
              </li>

            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;
