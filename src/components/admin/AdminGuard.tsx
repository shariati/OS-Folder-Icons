'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'admin')) {
      router.push('/');
    }
  }, [userProfile, loading, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!userProfile || userProfile.role !== 'admin') {
    return null; // Or a custom unauthorized page
  }

  return <>{children}</>;
}
