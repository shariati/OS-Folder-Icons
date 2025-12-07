'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { User, Mail, Calendar, Lock, Shield, Trash2, Camera, Loader2, AlertTriangle, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/format';

export default function ProfilePage() {
  const { user, userProfile, loading, updateUserProfile, changePassword, linkWithProvider, unlinkProvider, deleteAccount } = useAuth();
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
      showToast(error.message || 'Failed to change password. Check your current password.', 'error');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e0e5ec] dark:bg-gray-900">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#e0e5ec] dark:bg-gray-900 p-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Please Log In</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be logged in to view your profile.</p>
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
          Log In
        </a>
      </div>
    );
  }

  // Determine connected providers
  const connectedProviders = user.providerData.map(p => p.providerId);
  const isGoogleConnected = connectedProviders.includes('google.com');
  const isEmailLinked = connectedProviders.includes('password');

  return (
    <div className="min-h-screen bg-[#e0e5ec] dark:bg-gray-900 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account, security, and subscription</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <NeumorphBox className="p-6 flex flex-col items-center text-center">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mb-4 relative">
                        {photoURL ? (
                        <img src={photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                            <User size={50} />
                        </div>
                        )}
                    </div>
                </div>
              
              {!isEditing ? (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                        {userProfile?.displayName || user.displayName || 'User'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{user.email}</p>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="w-full py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
                    >
                        Edit Profile
                    </button>
                  </>
              ) : (
                  <form onSubmit={handleUpdateProfile} className="w-full space-y-4">
                      <div>
                          <label className="block text-left text-xs font-semibold text-gray-500 uppercase mb-1">Display Name</label>
                          <input 
                            type="text" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white text-sm"
                            placeholder="Your Name"
                          />
                      </div>
                      <div>
                          <label className="block text-left text-xs font-semibold text-gray-500 uppercase mb-1">Photo URL</label>
                          <input 
                            type="text" 
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white text-sm"
                            placeholder="https://..."
                          />
                      </div>
                      <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                            type="submit"
                            disabled={isUpdating}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                              {isUpdating && <Loader2 size={14} className="animate-spin" />}
                              Save
                          </button>
                      </div>
                  </form>
              )}

              <div className="w-full space-y-3 text-left mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Mail size={16} className="text-blue-500" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Calendar size={16} className="text-blue-500" />
                  <span>Joined {formatDate(userProfile?.createdAt, 'LONG', 'N/A')}</span>
                </div>
              </div>
            </NeumorphBox>

            {/* Social Login Section */}
            <NeumorphBox className="p-6">
                 <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                     <Shield size={20} className="text-purple-500" /> Connected Accounts
                 </h3>
                 <div className="space-y-3">
                     {/* Google */}
                     <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                            </div>
                             <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Google</span>
                         </div>
                         {isGoogleConnected ? (
                             <button
                                onClick={() => handleUnlinkProvider('google.com')}
                                className="text-red-500 hover:text-red-600 text-xs font-medium px-3 py-1 bg-red-50 dark:bg-red-900/10 rounded"
                            >
                                Disconnect
                            </button>
                         ) : (
                             <button 
                                onClick={() => handleLinkProvider('google')}
                                className="text-blue-600 hover:text-blue-700 text-xs font-medium px-3 py-1 bg-blue-50 dark:bg-blue-900/10 rounded"
                            >
                                Connect
                             </button>
                         )}
                     </div>
                 </div>
            </NeumorphBox>
          </div>

          {/* Right Column: Other Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subscription Manager */}
            <SubscriptionManager />

            {/* Password Change - Only for email/password users */}
            {isEmailLinked && (
                <NeumorphBox className="p-8">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-orange-500" /> Change Password
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                                required
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        <div className="pt-2">
                             <button 
                                type="submit" 
                                disabled={isChangingPassword}
                                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold shadow-md hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center gap-2"
                             >
                                 {isChangingPassword && <Loader2 size={16} className="animate-spin" />}
                                 Update Password
                             </button>
                        </div>
                    </form>
                </NeumorphBox>
            )}

            {/* Danger Zone */}
            <NeumorphBox className="p-8 border border-red-100 dark:border-red-900/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <AlertTriangle size={24} className="text-red-500" /> Danger Zone
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Deleting your account is permanent. All your data, including generated icons and bundles, will be wiped out.
                    <br/>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        Note: If you have an active subscription, you must cancel it first and wait for the period to end before deleting your account.
                    </span>
                </p>

                {!showDeleteConfirm ? (
                     <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg font-bold border border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center gap-2"
                     >
                        <Trash2 size={18} /> Delete Account
                     </button>
                ) : (
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-900/30">
                        <p className="font-bold text-red-700 dark:text-red-300 mb-4">Are you absolutely sure?</p>
                        <div className="flex gap-4">
                            <button 
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-transparent text-gray-600 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2"
                            >
                                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                                Yes, Delete My Account
                            </button>
                             <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
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
