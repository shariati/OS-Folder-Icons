'use client';

import { authenticatedFetch } from '@/lib/fetch-auth';

import { useState, useEffect } from 'react';
import { DB } from '@/lib/types';
import { UserProfile } from '@/types/user';
import { Trash2, Shield, User, Check, X, Eye, AlertTriangle, Network, Search, Key, Users as UsersIcon, Activity, Mail, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import clsx from 'clsx';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Fetched users data is not an array:', data);
        showToast('Failed to refresh users list', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/users?uid=${uid}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.uid !== uid));
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
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, role })
      });
      if (res.ok) {
        setUsers(users.map(u => u.uid === uid ? { ...u, role: role as any } : u));
        if (selectedUser?.uid === uid) setSelectedUser({ ...selectedUser, role: role as any });
        showToast('User role updated', 'success');
      }
    } catch (error) {
      showToast('Failed to update role', 'error');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reset_password', email })
        });
        const data = await res.json();
        if (data.success) {
            prompt('Password reset link generated (copy it):', data.link);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showToast('Failed to generate reset link', 'error');
    }
  };

  const handleManualActivation = async (uid: string) => {
    if (!confirm('Manually activate this user\'s account?')) return;
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          uid, 
          emailVerified: true,
          activatedAt: new Date().toISOString()
        })
      });
      if (res.ok) {
        setUsers(users.map(u => u.uid === uid ? { 
          ...u, 
          emailVerified: true,
          activatedAt: new Date().toISOString()
        } : u));
        if (selectedUser?.uid === uid) {
          setSelectedUser({ 
            ...selectedUser, 
            emailVerified: true,
            activatedAt: new Date().toISOString()
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.stripeCustomerId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterPending || !user.emailVerified;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString?: string) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
      });
  };

  return (
    <NeumorphBox className="p-6">
       <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 className="font-bold text-xl text-black dark:text-white flex items-center gap-2">
          <UsersIcon size={24} className="text-primary" />
          User Management
        </h3>
        <div className="flex gap-3 items-center w-full sm:w-auto">
          <button
            onClick={() => setFilterPending(!filterPending)}
            className={clsx(
              "px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap",
              filterPending 
                ? "bg-orange-500 text-white shadow-md" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-primary active:border-primary dark:border-gray-700 dark:bg-gray-800"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left">
              <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">User</th>
              <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Role</th>
              <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Activation</th>
              <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">Last Login</th>
              <th className="py-4 px-6 font-bold text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Loading users...</td></tr>
            ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={20} /></div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-black dark:text-white">{user.displayName || 'No Name'}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="py-4 px-6">
                            <select 
                                value={user.role}
                                onChange={(e) => handleUpdateRole(user.uid, e.target.value)}
                                className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer font-medium"
                            >
                                <option value="free">Free</option>
                                <option value="paid">Pro</option>
                                <option value="lifetime">Lifetime</option>
                                <option value="admin">Admin</option>
                            </select>
                        </td>
                        <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                                {user.emailVerified === false ? (
                                    <>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                            Pending
                                        </span>
                                        {getDaysPending(user)! >= 15 && (
                                            <div title={`Pending for ${getDaysPending(user)} days`}>
                                                <AlertTriangle 
                                                    size={18} 
                                                    className="text-red-500"
                                                />
                                            </div>
                                        )}
                                        {getDaysPending(user)! < 15 && (
                                            <span className="text-xs text-gray-500">
                                                {getDaysPending(user)}d
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        Activated
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="py-4 px-6">
                            <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-bold", 
                                user.subscriptionStatus === 'active' ? "bg-green-100 text-green-700" : 
                                user.subscriptionStatus === 'canceled' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                            )}>
                                {user.subscriptionStatus || 'Inactive'}
                            </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                            {formatDate(user.lastLoginAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                                {user.emailVerified === false && (
                                    <button 
                                        onClick={() => handleManualActivation(user.uid)} 
                                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                        title="Manually Activate"
                                    >
                                        <Check size={18} />
                                    </button>
                                )}
                                <button onClick={() => setSelectedUser(user)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                                    <Eye size={18} />
                                </button>
                                <button onClick={() => handleResetPassword(user.email!)} className="p-2 text-gray-500 hover:text-warning hover:bg-yellow-50 rounded-lg transition-colors" title="Reset Password">
                                    <Key size={18} />
                                </button>
                                <button onClick={() => handleDeleteUser(user.uid)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))
            ) : (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

        {/* Modal Logic Reuse from previous, just updated style */}
        {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-boxdark rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-boxdark z-10">
                    <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                        <User size={24} className="text-primary" />
                        User Details
                    </h3>
                    <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-8">
                     {/* Header Info */}
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-inner shrink-0">
                            {selectedUser.photoURL ? (
                                <img src={selectedUser.photoURL} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={48} /></div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-black dark:text-white">{selectedUser.displayName}</h2>
                            <p className="text-gray-500 font-medium">{selectedUser.email}</p>
                            <div className="flex items-center gap-2 pt-2">
                                <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400 select-all">
                                    {selectedUser.uid}
                                </span>
                                <span className={clsx("text-xs font-bold px-2 py-1 rounded capitalize", selectedUser.role === 'paid' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>
                                    {selectedUser.role} User
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs / Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Subscription Info */}
                        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                             <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-primary" /> Subscription
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <span className="font-medium capitalize">{selectedUser.subscriptionStatus}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Plan ID</span>
                                    <span className="font-medium">{selectedUser.planId || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Expires/Renews</span>
                                    <span className="font-medium">{formatDate(selectedUser.currentPeriodEnd)}</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-500 block mb-1 text-xs">Stripe Customer ID</span>
                                    <span className="font-mono text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 block w-full select-all">
                                        {selectedUser.stripeCustomerId || 'Not Linked'}
                                    </span>
                                </div>
                            </div>
                        </div>

                         {/* Activity Info */}
                         <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                             <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-primary" /> Activity
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Joined</span>
                                    <span className="font-medium">{formatDate(selectedUser.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Last Login</span>
                                    <span className="font-medium">{formatDate(selectedUser.lastLoginAt)}</span>
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
                         <div className="p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                            <h4 className="font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                <AlertTriangle size={18} /> Cancellation Feedback
                            </h4>
                            <div className="space-y-3 text-sm text-red-900 dark:text-red-200">
                                {selectedUser.cancellationReason && (
                                    <p>Reason: <strong>{selectedUser.cancellationReason}</strong></p>
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
