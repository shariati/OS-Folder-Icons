'use client';

import { useEffect, useRef } from 'react';
import { incrementViewCountAction } from '@/app/blog/actions';

interface ViewCounterProps {
  slug: string;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const hasCounted = useRef(false);

  useEffect(() => {
    if (!hasCounted.current) {
      incrementViewCountAction(slug);
      hasCounted.current = true;
    }
  }, [slug]);

  return null; // Invisible component
}
