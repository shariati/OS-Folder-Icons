'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { getFirebaseStorageUrl, FIREBASE_STORAGE } from '@/constants/links';

function SignupContent() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const { signInWithGoogle, signUpWithEmail } = useAuth();

  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleRedirect = () => {
    if (redirect) {
      router.push(redirect);
    } else {
      router.push('/');
    }
  };

  const handleGoogleSignIn = async () => {
    if (!ageConfirmed) {
      setError('You must confirm that you are at least 16 years old.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      handleRedirect();
    } catch (err) {
      setError('Failed to sign up with Google.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageConfirmed) {
      setError('You must confirm that you are at least 16 years old.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await signUpWithEmail(email, password);
      handleRedirect();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 py-12">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <div className="absolute inset-0 z-10 bg-white/60" /> {/* Overlay */}
        <video autoPlay loop muted playsInline className="h-full w-full object-cover">
          <source
            src={getFirebaseStorageUrl(FIREBASE_STORAGE.VIDEO_BACKGROUND)}
            type="video/webm"
          />
        </video>
      </div>

      <div className="relative z-20 mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center">
            <Link href="/" className="mb-6 inline-flex items-center justify-center">
              <Image
                src={getFirebaseStorageUrl(FIREBASE_STORAGE.LOGO)}
                alt="HDPick Logo"
                width={64}
                height={64}
                className="h-16 w-16"
                priority
              />
            </Link>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Create Account
            </h1>
            <p className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
              Personalize every pixel
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Join thousands of users customizing their desktops
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Primary: Social Login */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-4 py-4 font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-blue-500 dark:hover:bg-gray-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500 dark:bg-gray-800">
                  Or sign up with email
                </span>
              </div>
            </div>
          </div>

          {/* Secondary: Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            {/* Age Confirmation Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="ageConfirmation"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="ageConfirmation"
                className="cursor-pointer text-sm text-gray-600 dark:text-gray-400"
              >
                I confirm that I am at least <strong>16 years old</strong> and agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !ageConfirmed}
              className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-100 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Create Account with Email <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
        </div>
        <div className="border-t border-gray-100 bg-gray-50 px-8 py-6 text-center dark:border-gray-700 dark:bg-gray-900/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
