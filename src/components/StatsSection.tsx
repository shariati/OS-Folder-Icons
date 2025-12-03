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
      bg: 'bg-pink-100 dark:bg-pink-900/20'
    },
    {
      label: 'Stars on GitHub',
      value: '400+',
      icon: Star,
      color: 'text-yellow-500',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      label: 'Downloads',
      value: '10k+',
      icon: Download,
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      label: 'Happy Users',
      value: '5k+',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {stats.map((stat, index) => (
        <div key={index} className="flex flex-col items-center text-center p-6 rounded-3xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-transform duration-300">
          <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-4`}>
            <stat.icon className={`w-7 h-7 ${stat.color}`} />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
