'use client';

import {
  AlertTriangle,
  Calendar,
  Download,
  Loader2,
  Lock,
  Mail,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import SubscriptionManager from '@/components/subscription/SubscriptionManager';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/format';

export default function ProfilePage() {
  const {
    user,
    userProfile,
    loading,
    updateUserProfile,
    changePassword,
    linkWithProvider,
    unlinkProvider,
    deleteAccount,
  } = useAuth();
  const { showToast } = useToast();

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Danger Zone State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Data Export State
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || user?.displayName || '');
      setPhotoURL(userProfile.photoURL || user?.photoURL || '');
    } else if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [userProfile, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateUserProfile({ displayName, photoURL });
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showToast('Failed to update profile', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      showToast(
        error.message || 'Failed to change password. Check your current password.',
        'error'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLinkProvider = async (provider: 'google') => {
    try {
      await linkWithProvider(provider);
      showToast(`Successfully linked ${provider}`, 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || `Failed to link ${provider}`, 'error');
    }
  };

  const handleUnlinkProvider = async (providerId: string) => {
    try {
      await unlinkProvider(providerId);
      showToast('Successfully unlinked account', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to unlink account', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      // AuthContext handles redirect usually via user state change, but hard reload or redirect might be safer
      window.location.href = '/';
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to delete account', 'error');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const token = await user?.getIdToken();
      if (!token) {
        showToast('Please log in again to export data', 'error');
        return;
      }

      const response = await fetch('/api/user/export', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const data = await response.json();

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hdpick-my-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Your data has been downloaded', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to export data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e0e5ec] dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#e0e5ec] p-4 dark:bg-gray-900">
        <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Please Log In</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          You need to be logged in to view your profile.
        </p>
        <a
          href="/login"
          className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-blue-700"
        >
          Log In
        </a>
      </div>
    );
  }

  // Determine connected providers
  const connectedProviders = user.providerData.map((p) => p.providerId);
  const isGoogleConnected = connectedProviders.includes('google.com');
  const isEmailLinked = connectedProviders.includes('password');

  return (
    <div className="min-h-screen bg-[#e0e5ec] px-4 py-24 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 md:text-4xl dark:text-white">
            My Profile
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Manage your account, security, and subscription
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Profile Card */}
          <div className="space-y-8 lg:col-span-1">
            <NeumorphBox className="flex flex-col items-center p-6 text-center">
              <div className="group relative">
                <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-gray-700">
                  {photoURL ? (
                    <img src={photoURL} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <User size={50} />
                    </div>
                  )}
                </div>
              </div>

              {!isEditing ? (
                <>
                  <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-white">
                    {userProfile?.displayName || user.displayName || 'User'}
                  </h2>
                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full rounded-lg border border-blue-100 bg-white py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleUpdateProfile} className="w-full space-y-4">
                  <div>
                    <label className="mb-1 block text-left text-xs font-semibold uppercase text-gray-500">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-lg border-none bg-gray-50 px-4 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-left text-xs font-semibold uppercase text-gray-500">
                      Photo URL
                    </label>
                    <input
                      type="text"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="w-full rounded-lg border-none bg-gray-50 px-4 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 rounded-lg bg-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isUpdating && <Loader2 size={14} className="animate-spin" />}
                      Save
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-8 w-full space-y-3 border-t border-gray-100 pt-6 text-left dark:border-gray-800">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-300">
                  <Mail size={16} className="text-blue-500" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-300">
                  <Calendar size={16} className="text-blue-500" />
                  <span>Joined {formatDate(userProfile?.createdAt, 'LONG', 'N/A')}</span>
                </div>
              </div>
            </NeumorphBox>

            {/* Social Login Section */}
            <NeumorphBox className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
                <Shield size={20} className="text-purple-500" /> Connected Accounts
              </h3>
              <div className="space-y-3">
                {/* Google */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
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
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Google
                    </span>
                  </div>
                  {isGoogleConnected ? (
                    <button
                      onClick={() => handleUnlinkProvider('google.com')}
                      className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-500 hover:text-red-600 dark:bg-red-900/10"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLinkProvider('google')}
                      className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:bg-blue-900/10"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </NeumorphBox>
          </div>

          {/* Right Column: Other Settings */}
          <div className="space-y-8 lg:col-span-2">
            {/* Subscription Manager */}
            <SubscriptionManager />

            {/* Password Change - Only for email/password users */}
            {isEmailLinked && (
              <NeumorphBox className="p-8">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
                  <Lock size={20} className="text-orange-500" /> Change Password
                </h3>
                <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg border-none bg-gray-50 px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border-none bg-gray-50 px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border-none bg-gray-50 px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2 font-bold text-white shadow-md transition-all hover:bg-orange-600 disabled:opacity-50"
                    >
                      {isChangingPassword && <Loader2 size={16} className="animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </form>
              </NeumorphBox>
            )}

            {/* Download My Data */}
            <NeumorphBox className="relative overflow-hidden border border-blue-100 p-8 dark:border-blue-900/30">
              <div className="absolute left-0 top-0 h-full w-1 bg-blue-500"></div>

              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
                <Download size={24} className="text-blue-500" /> Download My Data
              </h3>

              <p className="mb-6 text-gray-600 dark:text-gray-400">
                You have the right to access all personal data we store about you. Click the button
                below to download a copy of your data in JSON format. This includes your profile
                information, saved configurations, and preferences.
              </p>

              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-6 py-3 font-bold text-blue-600 transition-all hover:bg-blue-100 disabled:opacity-50 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                {isExporting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Preparing Download...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download My Data
                  </>
                )}
              </button>
            </NeumorphBox>

            {/* Danger Zone */}
            <NeumorphBox className="relative overflow-hidden border border-red-100 p-8 dark:border-red-900/30">
              <div className="absolute left-0 top-0 h-full w-1 bg-red-500"></div>

              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
                <AlertTriangle size={24} className="text-red-500" /> Danger Zone
              </h3>

              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Deleting your account is permanent. All your data, including generated icons and
                bundles, will be wiped out.
                <br />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Note: If you have an active subscription, you must cancel it first and wait for
                  the period to end before deleting your account.
                </span>
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-6 py-3 font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={18} /> Delete Account
                </button>
              ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
                  <p className="mb-4 font-bold text-red-700 dark:text-red-300">
                    Are you absolutely sure?
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex items-center gap-2 bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {isDeleting && <Loader2 size={16} className="animate-spin" />}
                      Yes, Delete My Account
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </NeumorphBox>
          </div>
        </div>
      </div>
    </div>
  );
}
