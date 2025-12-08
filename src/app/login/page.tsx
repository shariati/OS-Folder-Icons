'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { InputModal } from '@/components/ui/InputModal';
import { getFirebaseStorageUrl, FIREBASE_STORAGE } from '@/constants/links';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signInWithEmail, sendMagicLink, signInWithMagicLink } = useAuth();
  const router = useRouter();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const completeMagicLinkSignIn = async (emailForSignIn: string) => {
      setLoading(true);
      try {
          await signInWithMagicLink(emailForSignIn, window.location.href);
          router.push('/');
      } catch (err: any) {
          setError(err.message || 'Failed to sign in with magic link.');
      } finally {
          setLoading(false);
      }
  };
  
  // Handle Magic Link Sign-In on Check
  React.useEffect(() => {
    const checkMagicLink = async () => {
        const { isSignInWithEmailLink } = await import('firebase/auth');
        const { getFirebaseAuth } = await import('@/lib/firebase/client');
        const auth = getFirebaseAuth();
        
        if (auth && isSignInWithEmailLink(auth, window.location.href)) {
             // Try sessionStorage first (new approach), fallback to localStorage for existing users
             const emailForSignIn = window.sessionStorage.getItem('emailForSignIn') || window.localStorage.getItem('emailForSignIn');
             if (!emailForSignIn) {
                 setIsEmailModalOpen(true);
             } else {
                 completeMagicLinkSignIn(emailForSignIn);
             }
        }
    };
    checkMagicLink();
  }, [signInWithMagicLink, router]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      router.push('/');
    } catch (err) {
      setError('Failed to sign in with Google.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mode state: 'password' | 'magic_link'
  const [loginMode, setLoginMode] = useState<'password' | 'magic_link'>('password');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (loginMode === 'magic_link') {
        try {
            setSuccess('');
            await sendMagicLink(email);
            setSuccess('Magic link sent! Check your email (including spam/junk) to sign in instantly.');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/quota-exceeded') {
                setError('Too many login attempts. Please try again later or use a password to sign in.');
            } else {
                setError(err.message || 'Failed to send magic link.');
            }
        } finally {
            setLoading(false);
        }
    } else {
         try {
            await signInWithEmail(email, password);
            router.push('/');
         } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else {
                setError('Failed to sign in. Please try again.');
            }
         } finally {
            setLoading(false);
         }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-white/60 z-10" /> {/* Overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={getFirebaseStorageUrl(FIREBASE_STORAGE.VIDEO_BACKGROUND)} type="video/webm" />
        </video>
      </div>

      <InputModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={completeMagicLinkSignIn}
        title="Confirm Email"
        label="Please provide your email to complete sign in"
        placeholder="you@example.com"
        type="email"
        confirmLabel="Sign In"
      />

      <div className="relative z-20 w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center mb-6">
              <Image
                src={getFirebaseStorageUrl(FIREBASE_STORAGE.LOGO)}
                alt="HDPick Logo"
                width={64}
                height={64}
                className="w-16 h-16"
                priority
              />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Personalize every pixel</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Sign in to access your icons</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium text-center">
              {success}
            </div>
          )}

          {/* Primary: Social Login */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          {/* Secondary: Email/Password Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {loginMode === 'password' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                     <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Forgot password?
                     </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="block w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
            )}
            
            {loginMode === 'magic_link' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">What is a Magic Link?</p>
                    <p>We'll send a secure link to your email. Click it to log in instantly without a password. It's safe and convenient!</p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-gray-200 dark:border-gray-600"
            >
                {loginMode === 'magic_link' ? 'Send Magic Link' : 'Sign In with Email'} <ArrowRight className="ml-2 w-4 h-4" />
            </button>
            
            <div className="text-center">
                <button
                    type="button"
                    onClick={() => setLoginMode(loginMode === 'magic_link' ? 'password' : 'magic_link')}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors underline decoration-dotted underline-offset-4"
                >
                    {loginMode === 'magic_link' ? 'Use password instead' : 'Use magic link instead'}
                </button>
            </div>
          </form>
        </div>
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
