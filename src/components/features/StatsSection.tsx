'use client';

import React from 'react';
import { Download, Users, FolderHeart, Star } from 'lucide-react';

export function StatsSection() {
  const stats = [
    {
      label: 'Total Icons',
      value: '1,200+',
      icon: FolderHeart,
      color: 'text-pink-500',
      bg: 'bg-pink-100 dark:bg-pink-900/20',
    },
    {
      label: 'Stars on GitHub',
      value: '400+',
      icon: Star,
      color: 'text-yellow-500',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      label: 'Downloads',
      value: '10k+',
      icon: Download,
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Happy Users',
      value: '5k+',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
  ];

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col items-center rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-lg transition-transform duration-300 hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className={`h-14 w-14 rounded-2xl ${stat.bg} mb-4 flex items-center justify-center`}>
            <stat.icon className={`h-7 w-7 ${stat.color}`} />
          </div>
          <h3 className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
          <p className="font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
