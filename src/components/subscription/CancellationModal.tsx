import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X, AlertTriangle } from 'lucide-react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { useToast } from '@/components/ui/Toast';

interface CancellationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [reason, setReason] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleCancel = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/stripe/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    reason: reason || 'Other',
                    feedback
                }),
            });

            const data = await response.json();
            if (response.ok) {
                onSuccess();
                setStep(3); // Success step
                // Ideally close after a timeout or let user close
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else {
                showToast('Failed to cancel: ' + (data.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Cancellation error:', error);
            showToast('An error occurred during cancellation.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {step === 1 ? 'Cancel Subscription' : step === 2 ? 'Share your feedback' : 'Subscription Cancelled'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X size={24} />
                        </button>
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 flex items-start gap-4">
                                <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                                        Are you sure you want to cancel?
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                        You will lose access to premium features like unlimited downloads and custom icons at the end of your current billing period.
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                We'd love to keep you around! Is there anything we can do to change your mind?
                            </p>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                                >
                                    Keep My Plan
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Proceed to Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                We are sorry to see you go. Could you tell us a bit more about why you are leaving? Your feedback helps us build a better product.
                            </p>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Primary Reason
                                </label>
                                <select 
                                    value={reason} 
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="too_expensive">Too expensive</option>
                                    <option value="missing_features">Missing features</option>
                                    <option value="buggy">Encountered bugs</option>
                                    <option value="no_longer_needed">No longer needed</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Additional Comments 
                                    <span className={`ml-2 text-[10px] ${feedback.length >= 300 ? 'text-red-500' : 'text-gray-400'}`}>
                                        ({feedback.length}/300)
                                    </span>
                                </label>
                                <textarea
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                    placeholder="What could we have done better?"
                                    value={feedback}
                                    maxLength={300}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleCancel}
                                    disabled={loading || !reason}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors flex justify-center"
                                >
                                    {loading ? 'Processing...' : 'Confirm Cancellation'}
                                </button>
                                <button
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Subscription Cancelled</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Your subscription has been cancelled. You will retain access until the end of your current billing period.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
