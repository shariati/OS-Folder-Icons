'use client';

import clsx from 'clsx';
import {
  Activity,
  AlertTriangle,
  Check,
  Clock,
  Eye,
  Key,
  Search,
  Shield,
  Trash2,
  User,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { CopyModal } from '@/components/ui/CopyModal';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/lib/fetch-auth';
import { formatDate } from '@/lib/format';
import { DB } from '@/lib/types';
import { UserProfile } from '@/types/user';

interface UsersManagerProps {
  initialData: DB;
}

export function UsersManager({ initialData }: UsersManagerProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialData.users || []);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPending, setFilterPending] = useState(false);
  const { showToast } = useToast();

  // Copy Modal state for password reset link
  const [isResetLinkModalOpen, setIsResetLinkModalOpen] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const { user, loading: authLoading } = useAuth();

  // useRef to verify successful initialization only once
  const initialized = useRef(false);

  useEffect(() => {
    const init = async () => {
      if (!authLoading && user && !initialized.current) {
        initialized.current = true;

        // If we already have initialData (from server), don't fetch immediately
        if (users.length > 0) {
          console.log('UsersManager: Initial data present, skipping auto-fetch.');
          setLoading(false);
          return;
        }

        try {
          // Must force refresh to get the latest claims (admin role) that might have just been set
          await user.getIdToken(true);
          const idTokenResult = await user.getIdTokenResult();
          console.log('INIT DEBUG Verified Claims:', idTokenResult.claims);

          if (idTokenResult.claims.role !== 'admin' && idTokenResult.claims.admin !== true) {
            console.error(
              'CLIENT SECURITY CHECK: User is not recognized as admin by Firebase Client SDK.'
            );
            showToast(
              'Security Warning: You are not recognized as an admin. API access will fail.',
              'error'
            );
            // Do not fetch - save the 401
            return;
          }

          // Always fetch fresh data on mount to ensure we have the latest
          fetchUsers();
        } catch (err) {
          console.error('Error initializing user admin view:', err);
        }
      }
    };

    init();
  }, [user, authLoading]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (user) await user.getIdToken(true); // Ensure token is fresh before manual fetch

      const res = await authenticatedFetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
        showToast('Users list refreshed', 'success');
      } else {
        console.error('Fetched users data is not an array:', data);
        showToast(`Failed to refresh: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const debugClaims = async () => {
    if (!user) return;
    const res = await user.getIdTokenResult(true);
    console.log('DEBUG CLAIMS:', res.claims);
    showToast(`Role: ${res.claims.role}, Admin: ${res.claims.admin}`, 'info');
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.'))
      return;

    try {
      const res = await authenticatedFetch(`/api/admin/users?uid=${uid}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter((u) => u.uid !== uid));
        showToast('User deleted successfully', 'success');
        if (selectedUser?.uid === uid) setSelectedUser(null);
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showToast('Failed to delete user', 'error');
    }
  };

  const handleUpdateRole = async (uid: string, role: string) => {
    try {
      const res = await authenticatedFetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, role }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.uid === uid ? { ...u, role: role as any } : u)));
        if (selectedUser?.uid === uid) setSelectedUser({ ...selectedUser, role: role as any });
        showToast('User role updated', 'success');
      }
    } catch (error) {
      showToast('Failed to update role', 'error');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const res = await authenticatedFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', email }),
      });
      const data = await res.json();
      if (data.success) {
        setResetLink(data.link);
        setIsResetLinkModalOpen(true);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      showToast('Failed to generate reset link', 'error');
    }
  };

  const handleManualActivation = async (uid: string) => {
    if (!confirm("Manually activate this user's account?")) return;

    try {
      const res = await authenticatedFetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          emailVerified: true,
          activatedAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setUsers(
          users.map((u) =>
            u.uid === uid
              ? {
                  ...u,
                  emailVerified: true,
                  activatedAt: new Date().toISOString(),
                }
              : u
          )
        );
        if (selectedUser?.uid === uid) {
          setSelectedUser({
            ...selectedUser,
            emailVerified: true,
            activatedAt: new Date().toISOString(),
          });
        }
        showToast('User activated successfully', 'success');
      }
    } catch (error) {
      showToast('Failed to activate user', 'error');
    }
  };

  const getDaysPending = (user: UserProfile): number | null => {
    if (user.emailVerified) return null;
    const createdDate = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.stripeCustomerId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !filterPending || !user.emailVerified;

    return matchesSearch && matchesFilter;
  });

  const formatDateForAdmin = (dateString?: string) => formatDate(dateString, 'LONG_ABBR', 'N/A');

  return (
    <NeumorphBox className="p-6">
      {/* Password Reset Link Modal */}
      <CopyModal
        isOpen={isResetLinkModalOpen}
        onClose={() => {
          setIsResetLinkModalOpen(false);
          setResetLink('');
        }}
        title="Password Reset Link"
        label="Copy this link and send it to the user:"
        value={resetLink}
      />
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
          <UsersIcon size={24} className="text-primary" />
          User Management
        </h3>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button
            onClick={debugClaims}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            Debug Auth
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="hover:text-primary cursor-pointer rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
            title="Refresh List"
          >
            <Activity size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setFilterPending(!filterPending)}
            className={clsx(
              'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all',
              filterPending
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            <div className="flex items-center gap-2">
              <Clock size={16} />
              Pending Only
            </div>
          </button>
          <div className="relative flex-1 sm:w-96">
            <input
              type="text"
              placeholder="Search by email, name, or Stripe ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:border-primary active:border-primary w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 outline-none transition dark:border-gray-700 dark:bg-gray-800"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-left dark:bg-gray-800">
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                User
              </th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Role
              </th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Activation
              </th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Status
              </th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Last Login
              </th>
              <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.uid}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-500">
                            <User size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-black dark:text-white">
                          {user.displayName || 'No Name'}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.uid, e.target.value)}
                      className="cursor-pointer border-none bg-transparent text-sm font-medium focus:ring-0"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Pro</option>
                      <option value="lifetime">Lifetime</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.emailVerified === false ? (
                        <>
                          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            Pending
                          </span>
                          {getDaysPending(user)! >= 15 && (
                            <div title={`Pending for ${getDaysPending(user)} days`}>
                              <AlertTriangle size={18} className="text-red-500" />
                            </div>
                          )}
                          {getDaysPending(user)! < 15 && (
                            <span className="text-xs text-gray-500">{getDaysPending(user)}d</span>
                          )}
                        </>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Activated
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        'rounded-full px-2.5 py-0.5 text-xs font-bold',
                        user.subscriptionStatus === 'active'
                          ? 'bg-green-100 text-green-700'
                          : user.subscriptionStatus === 'canceled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {user.subscriptionStatus || 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDateForAdmin(user.lastLoginAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.emailVerified === false && (
                        <button
                          onClick={() => handleManualActivation(user.uid)}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600"
                          title="Manually Activate"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.email!)}
                        className="hover:text-warning rounded-lg p-2 text-gray-500 transition-colors hover:bg-yellow-50"
                        title="Reset Password"
                      >
                        <Key size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.uid)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Logic Reuse from previous, just updated style */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="dark:bg-boxdark max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="dark:bg-boxdark sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-6 dark:border-gray-700">
              <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
                <User size={24} className="text-primary" />
                User Details
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8 p-6">
              {/* Header Info */}
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 shadow-inner dark:bg-gray-800">
                  {selectedUser.photoURL ? (
                    <img
                      src={selectedUser.photoURL}
                      alt="User"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-black dark:text-white">
                    {selectedUser.displayName}
                  </h2>
                  <p className="font-medium text-gray-500">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="select-all rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {selectedUser.uid}
                    </span>
                    <span
                      className={clsx(
                        'rounded px-2 py-1 text-xs font-bold capitalize',
                        selectedUser.role === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {selectedUser.role} User
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs / Sections */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Subscription Info */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                  <h4 className="mb-4 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                    <Shield size={18} className="text-primary" /> Subscription
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="font-medium capitalize">
                        {selectedUser.subscriptionStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plan ID</span>
                      <span className="font-medium">{selectedUser.planId || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expires/Renews</span>
                      <span className="font-medium">
                        {formatDateForAdmin(selectedUser.currentPeriodEnd)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                      <span className="mb-1 block text-xs text-gray-500">Stripe Customer ID</span>
                      <span className="block w-full select-all rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs dark:border-gray-600 dark:bg-gray-900">
                        {selectedUser.stripeCustomerId || 'Not Linked'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity Info */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                  <h4 className="mb-4 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                    <Activity size={18} className="text-primary" /> Activity
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Joined</span>
                      <span className="font-medium">
                        {formatDateForAdmin(selectedUser.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Login</span>
                      <span className="font-medium">
                        {formatDateForAdmin(selectedUser.lastLoginAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Folders Generated</span>
                      <span className="font-medium">{selectedUser.generatedFoldersCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              {(selectedUser.cancellationFeedback || selectedUser.cancellationReason) && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-900/10">
                  <h4 className="mb-4 flex items-center gap-2 font-bold text-red-700 dark:text-red-400">
                    <AlertTriangle size={18} /> Cancellation Feedback
                  </h4>
                  <div className="space-y-3 text-sm text-red-900 dark:text-red-200">
                    {selectedUser.cancellationReason && (
                      <p>
                        Reason: <strong>{selectedUser.cancellationReason}</strong>
                      </p>
                    )}
                    {selectedUser.cancellationFeedback && (
                      <p className="italic">"{selectedUser.cancellationFeedback}"</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </NeumorphBox>
  );
}
