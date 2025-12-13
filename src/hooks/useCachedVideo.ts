import { useEffect, useState } from 'react';

const videoCache = new Map<string, string>();

export function useCachedVideo(src: string | undefined) {
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setCachedSrc(null);
      return;
    }

    if (videoCache.has(src)) {
      setCachedSrc(videoCache.get(src)!);
      return;
    }

    let active = true;

    // Start fetching
    const fetchVideo = async () => {
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        if (!active) return;

        const objectUrl = URL.createObjectURL(blob);
        videoCache.set(src, objectUrl);
        setCachedSrc(objectUrl);
      } catch (error) {
        console.warn('Warning: Failed to cache video, falling back to direct URL:', error);
        // Fallback to original source if caching fails
        if (active) setCachedSrc(src);
      }
    };

    fetchVideo();

    return () => {
      active = false;
    };
  }, [src]);

  return cachedSrc;
}
