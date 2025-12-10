'use client';

import React, { useState, useEffect } from 'react';
import { getFirebaseStorageUrl, FIREBASE_STORAGE } from '@/constants/links';

export function VideoBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 z-0 h-full w-full bg-gray-200 dark:bg-gray-800">
        <div className="absolute inset-0 z-10 bg-white/60" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      <div className="absolute inset-0 z-10 bg-white/60" /> {/* Overlay */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
        suppressHydrationWarning
      >
        <source src={getFirebaseStorageUrl(FIREBASE_STORAGE.VIDEO_BACKGROUND)} type="video/webm" />
      </video>
    </div>
  );
}
