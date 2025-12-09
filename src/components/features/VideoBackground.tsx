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
      <div className="absolute inset-0 w-full h-full z-0 bg-gray-200 dark:bg-gray-800">
        <div className="absolute inset-0 bg-white/60 z-10" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <div className="absolute inset-0 bg-white/60 z-10" /> {/* Overlay */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        suppressHydrationWarning
      >
        <source src={getFirebaseStorageUrl(FIREBASE_STORAGE.VIDEO_BACKGROUND)} type="video/webm" />
      </video>
    </div>
  );
}
