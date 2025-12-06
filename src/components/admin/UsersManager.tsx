'use client';

import { useState, useEffect } from 'react';
import { DB } from '@/lib/types';
import { UserProfile } from '@/types/user';
import { Trash2, Shield, User, Check, X, Eye, AlertTriangle, Network } from 'lucide-react';
import { updateUserRoleAction, deleteUserAction } from '@/app/admin/actions';
import { useToast } from '@/components/ui/Toast';
import { NeumorphBox } from '@/components/ui/NeumorphBox';

interface UsersManagerProps {
  initialData: DB;
}

export function UsersManager({ initialData }: UsersManagerProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialData.users || []);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const { showToast } = useToast();

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user? This only removes the database record.')) return;

    try {
      setIsLoading(true);
      await deleteUserAction(uid);
      
      const updatedUsers = users.filter(u => u.uid !== uid);
      setUsers(updatedUsers);
      
      showToast('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Failed to delete user', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: 'admin' | 'free' | 'paid' | 'lifetime') => {
    // We only support admin, user (free/paid), lifetime in the action type currently.
    // The action expects 'admin' | 'user' | 'lifetime'.
    // We need to map 'free'/'paid' to 'user' or update the action type.
    // Actually UserProfile has 'admin' | 'free' | 'paid' | 'lifetime'.
    // But my action defined 'admin' | 'user' | 'lifetime'.
    // I should fix the action to match UserProfile.
    
    // Let's assume for now we map free/paid to user for the action, OR I fix the action.
    // I should fix the action.
    // But for this step I will just pass it and cast if needed, but better to fix action.
    // Let's fix action in next step if needed.
    // Wait, `dbUpdateUser` takes `Partial<UserProfile>`.
    // So `role` can be any valid role.
    // The action signature was restrictive.
    
    try {
      setIsLoading(true);
      await updateUserRoleAction(uid, newRole);
      
      const updatedUsers = users.map(u => 
        u.uid === uid ? { ...u, role: newRole } : u
      );
      setUsers(updatedUsers);

      showToast('User role updated', 'success');
    } catch (error) {
      console.error('Error updating role:', error);
      showToast('Failed to update role', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NeumorphBox className="p-6">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                User
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Role
              </th>
               <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Subscription
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Joined Date
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, key) => (
              <tr key={key}>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="h-12.5 w-15 rounded-md">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="User" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-black dark:text-white">
                      {user.displayName || user.email}
                      <br />
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </p>
                  </div>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.uid, e.target.value as any)}
                    className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="admin">Admin</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                   <div className="flex flex-col">
                        <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                            user.role === 'paid' ? 'bg-success text-success' :
                            user.role === 'lifetime' ? 'bg-warning text-warning' :
                            'bg-gray-500 text-gray-500'
                        }`}>
                            {user.role === 'paid' ? 'Pro' : user.role === 'lifetime' ? 'Lifetime' : 'Free'}
                        </span>
                        {user.subscriptionStatus === 'canceled' && (
                            <span className="text-xs text-danger mt-1">Canceled</span>
                        )}
                         {user.cancelAtPeriodEnd && (
                            <span className="text-xs text-warning mt-1">Cancels Soon</span>
                        )}
                   </div>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex items-center space-x-3.5">
                    <button
                        onClick={() => setSelectedUser(user)}
                        className="hover:text-primary"
                        title="View Details"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.uid)}
                      className="hover:text-primary"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-boxdark rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-stroke dark:border-strokedark flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-black dark:text-white">User Details</h3>
                    <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                         <div className="h-16 w-16 mobile-menu-img rounded-full overflow-hidden">
                            {selectedUser.photoURL ? (
                                <img src={selectedUser.photoURL} alt="User" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-primary text-white">
                                    <User size={32} />
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-black dark:text-white">{selectedUser.displayName || 'No Name'}</h4>
                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            <p className="text-xs text-gray-400 mt-1">UID: {selectedUser.uid}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 dark:bg-meta-4 rounded-lg">
                            <h5 className="font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
                                <Shield size={18} /> Subscription Info
                            </h5>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-500">Role:</span> <span className="font-medium text-black dark:text-white capitalize">{selectedUser.role}</span></p>
                                <p><span className="text-gray-500">Status:</span> <span className="font-medium text-black dark:text-white capitalize">{selectedUser.subscriptionStatus || 'N/A'}</span></p>
                                <p><span className="text-gray-500">Plan ID:</span> <span className="font-medium text-black dark:text-white">{selectedUser.planId || 'N/A'}</span></p>
                                <p><span className="text-gray-500">Period End:</span> <span className="font-medium text-black dark:text-white">{selectedUser.currentPeriodEnd ? new Date(selectedUser.currentPeriodEnd).toLocaleDateString() : 'N/A'}</span></p>
                                 {selectedUser.stripeCustomerId && (
                                     <p className="mt-2 text-xs bg-gray-200 dark:bg-gray-700 p-1.5 rounded break-all font-mono">
                                         {selectedUser.stripeCustomerId}
                                     </p>
                                 )}
                            </div>
                        </div>

                         <div className="p-4 bg-gray-50 dark:bg-meta-4 rounded-lg">
                            <h5 className="font-semibold text-black dark:text-white mb-3">Stats & Usage</h5>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-500">Joined:</span> <span className="font-medium text-black dark:text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</span></p>
                                <p><span className="text-gray-500">Generated Folders:</span> <span className="font-medium text-black dark:text-white">{selectedUser.generatedFoldersCount || 0}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="p-4 bg-gray-50 dark:bg-meta-4 rounded-lg">
                             <h5 className="font-semibold text-black dark:text-white mb-3 flex items-center gap-2">
                                <Network size={18} /> Connected Accounts
                            </h5>
                            <div className="space-y-2">
                                {selectedUser.providers && selectedUser.providers.length > 0 ? (
                                    selectedUser.providers.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-black dark:text-white capitalize">
                                                    {p.providerId.replace('.com', '')}
                                                </span>
                                                {p.email && <span className="text-xs text-gray-400">({p.email})</span>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No connected providers found (likely email/pass only)</p>
                                )}
                            </div>
                        </div>
                    </div>

                   {(selectedUser.cancellationFeedbackHistory && selectedUser.cancellationFeedbackHistory.length > 0) ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                            <h5 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                                <AlertTriangle size={18} /> Cancellation Feedback History
                            </h5>
                            <div className="space-y-4">
                                {[...selectedUser.cancellationFeedbackHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, index) => (
                                    <div key={index} className="border-b border-red-100 dark:border-red-900/30 last:border-0 pb-3 last:pb-0">
                                        <div className="flex justify-between items-start">
                                            <p className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wide">
                                                {item.reason.replace(/_/g, ' ')}
                                            </p>
                                            <span className="text-[10px] text-gray-500 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                                {new Date(item.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {item.feedback && (
                                            <p className="text-black dark:text-white mt-1 text-sm italic">"{item.feedback}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                   ) : (selectedUser.cancellationReason || selectedUser.cancellationFeedback) && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                            <h5 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                                <AlertTriangle size={18} /> Cancellation Feedback
                            </h5>
                            <div className="space-y-3 text-sm">
                                {selectedUser.cancellationReason && (
                                    <div>
                                        <p className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wide">Reason</p>
                                        <p className="text-black dark:text-white mt-1 capitalize">{selectedUser.cancellationReason.replace(/_/g, ' ')}</p>
                                    </div>
                                )}
                                {selectedUser.cancellationFeedback && (
                                    <div>
                                        <p className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wide">Feedback</p>
                                        <p className="text-black dark:text-white mt-1 italic">"{selectedUser.cancellationFeedback}"</p>
                                    </div>
                                )}
                                 {selectedUser.cancelledAt && (
                                    <p className="text-xs text-gray-500 mt-2 text-right">
                                        Cancelled on {new Date(selectedUser.cancelledAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                   )}
                </div>
                <div className="p-6 border-t border-stroke dark:border-strokedark flex justify-end">
                    <button 
                        onClick={() => setSelectedUser(null)}
                        className="px-6 py-2.5 bg-primary hover:bg-opacity-90 text-white rounded font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </NeumorphBox>
  );
}
