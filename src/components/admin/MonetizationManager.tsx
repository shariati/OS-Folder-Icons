'use client';

import React, { useState, useEffect } from 'react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { Plan } from '@/types/plan';
import { Plus, Edit, Trash, Save, X, Check, RefreshCw } from 'lucide-react';
import { AdSettings } from './AdSettings';
import { authenticatedFetch } from '@/lib/fetch-auth';

export function MonetizationManager() {
  const [activeTab, setActiveTab] = useState<'plans' | 'ads'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);

  const [syncing, setSyncing] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
  
  // Sync modal states
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [missingProducts, setMissingProducts] = useState<Plan[]>([]);
  const [selectedNewProducts, setSelectedNewProducts] = useState<Set<string>>(new Set());
  const [selectedMissingProducts, setSelectedMissingProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPlans();
    fetchLastSyncDate();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastSyncDate = async () => {
    try {
      const res = await fetch('/api/admin/sync-status');
      const data = await res.json();
      if (data.lastSyncDate) {
        setLastSyncDate(data.lastSyncDate);
      }
    } catch (error) {
      console.error('Failed to fetch last sync date', error);
    }
  };

  const updateLastSyncDate = async () => {
    const now = new Date().toISOString();
    try {
      await authenticatedFetch('/api/admin/sync-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastSyncDate: now }),
      });
      setLastSyncDate(now);
    } catch (error) {
      console.error('Failed to update sync date', error);
    }
  };

  const handleSyncWithStripe = async () => {
    setSyncing(true);
    try {
      // Fetch new products from Stripe
      const newProductsRes = await authenticatedFetch('/api/admin/plans/stripe-products');
      const newProductsData = await newProductsRes.json();
      
      // Fetch missing products
      const missingRes = await authenticatedFetch('/api/admin/plans/sync-check', { method: 'POST' });
      const missingData = await missingRes.json();

      setSyncing(false);

      const hasNewProducts = Array.isArray(newProductsData) && newProductsData.length > 0;
      const hasMissingProducts = missingData.missingPlans && missingData.missingPlans.length > 0;

      if (!hasNewProducts && !hasMissingProducts) {
        alert('All synced! No changes detected.');
        await updateLastSyncDate();
        return;
      }

      // Show sync modal with results
      setNewProducts(hasNewProducts ? newProductsData : []);
      setMissingProducts(hasMissingProducts ? missingData.missingPlans : []);
      setSelectedNewProducts(new Set());
      setSelectedMissingProducts(new Set());
      setShowSyncModal(true);

    } catch (error) {
      console.error('Sync failed', error);
      setSyncing(false);
      alert('Sync check failed.');
    }
  };

  const handleApplySync = async () => {
    try {
      // Import selected new products
      for (const productId of selectedNewProducts) {
        const product = newProducts.find(p => p.id === productId);
        if (product) {
          await authenticatedFetch('/api/admin/plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: product.productName,
              description: product.productDescription || '',
              price: product.amount,
              currency: product.currency,
              interval: product.interval,
              features: product.marketingFeatures || [],
              stripePriceId: product.id,
              type: product.type,
              active: true,
            }),
          });
        }
      }

      // Delete selected missing products
      for (const productId of selectedMissingProducts) {
        await authenticatedFetch('/api/admin/plans', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: productId }),
        });
      }

      // Update last sync date
      await updateLastSyncDate();

      // Refresh plans and close modal
      setShowSyncModal(false);
      fetchPlans();
      
      const importedCount = selectedNewProducts.size;
      const deletedCount = selectedMissingProducts.size;
      alert(`Sync complete! Imported: ${importedCount}, Deleted: ${deletedCount}`);
    } catch (error) {
      console.error('Failed to apply sync', error);
      alert('Failed to apply sync changes.');
    }
  };

  const toggleNewProduct = (productId: string) => {
    const newSet = new Set(selectedNewProducts);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    setSelectedNewProducts(newSet);
  };

  const toggleMissingProduct = (productId: string) => {
    const newSet = new Set(selectedMissingProducts);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    setSelectedMissingProducts(newSet);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      const method = editingPlan.id ? 'PUT' : 'POST';
      const res = await authenticatedFetch('/api/admin/plans', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlan),
      });

      if (res.ok) {
        setEditingPlan(null);
        fetchPlans();
      } else {
        const err = await res.json();
        alert('Error saving plan: ' + err.error);
      }
    } catch (error) {
      console.error('Failed to save plan', error);
      alert('Failed to save plan');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      await authenticatedFetch('/api/admin/plans', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete plan', error);
    }
  };

  const formatSyncDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-2 px-4 font-medium ${activeTab === 'plans' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Subscription Plans
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`pb-2 px-4 font-medium ${activeTab === 'ads' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Ad Settings
        </button>
      </div>

      {activeTab === 'ads' && <AdSettings />}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Manage Plans</h3>
              <p className="text-sm text-gray-500 mt-1">
                Last synced: {formatSyncDate(lastSyncDate)}
              </p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={handleSyncWithStripe}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                    Sync with Stripe
                </button>
                <button
                onClick={() => setEditingPlan({
                    name: '',
                    description: '',
                    price: 0,
                    currency: 'USD',
                    interval: 'month',
                    features: [],
                    stripePriceId: '',
                    type: 'subscription',
                    active: true,
                })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                <Plus size={16} />
                Add Plan
                </button>
            </div>
          </div>

          {editingPlan && (
            <NeumorphBox className="p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Interval</label>
                  <select
                    value={editingPlan.interval}
                    onChange={(e) => setEditingPlan({ ...editingPlan, interval: e.target.value as any })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                    <option value="one-time">One-time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={editingPlan.type}
                    onChange={(e) => setEditingPlan({ ...editingPlan, type: e.target.value as any })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="subscription">Subscription</option>
                    <option value="payment">One-time Payment</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={editingPlan.description}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Stripe Price ID</label>
                  <input
                    type="text"
                    value={editingPlan.stripePriceId}
                    onChange={(e) => setEditingPlan({ ...editingPlan, stripePriceId: e.target.value })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Leave empty to auto-create in Stripe"
                  />
                  {!editingPlan.stripePriceId && <p className="text-xs text-gray-500 mt-1">If left empty, a new Product and Price will be created in Stripe upon saving.</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Features (comma separated)</label>
                  <textarea
                    value={editingPlan.features?.join(', ')}
                    onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value.split(',').map(f => f.trim()) })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        checked={editingPlan.active} 
                        onChange={(e) => setEditingPlan({ ...editingPlan, active: e.target.checked })}
                    />
                    <label>Active</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Plan
                </button>
              </div>
            </NeumorphBox>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <NeumorphBox key={plan.id} className="p-6 relative group">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash size={16} />
                  </button>
                </div>
                <div className="mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${plan.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {plan.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="ml-2 text-xs font-bold px-2 py-1 bg-gray-100 text-gray-800 rounded uppercase">
                        {plan.type === 'payment' ? 'ONE-TIME' : plan.interval}
                    </span>
                </div>
                <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  ${plan.price} <span className="text-sm text-gray-500 font-normal">/{plan.interval}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{plan.description}</p>
                <div className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check size={14} className="mt-1 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 font-mono break-all">
                    ID: {plan.stripePriceId}
                </div>
              </NeumorphBox>
            ))}
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">Sync with Stripe</h3>
              <button onClick={() => setShowSyncModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* New Products Section */}
              {newProducts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold mb-3 text-green-700 dark:text-green-400">
                    New Products Found in Stripe ({newProducts.length})
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Select products to import into HDPick:
                  </p>
                  <div className="space-y-3">
                    {newProducts.map((prod) => (
                      <div key={prod.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedNewProducts.has(prod.id)}
                          onChange={() => toggleNewProduct(prod.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h5 className="font-bold">{prod.productName}</h5>
                          <p className="text-sm text-gray-500">{prod.productDescription || 'No description'}</p>
                          <div className="flex gap-2 mt-2 text-xs">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {prod.currency.toUpperCase()} {prod.amount}
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded uppercase">
                              {prod.interval}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Products Section */}
              {missingProducts.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-3 text-red-700 dark:text-red-400">
                    Products Missing from Stripe ({missingProducts.length})
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    These products exist in HDPick but are no longer active in Stripe. Select to delete:
                  </p>
                  <div className="space-y-3">
                    {missingProducts.map((prod) => (
                      <div key={prod.id} className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMissingProducts.has(prod.id)}
                          onChange={() => toggleMissingProduct(prod.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h5 className="font-bold">{prod.name}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{prod.description}</p>
                          <div className="flex gap-2 mt-2 text-xs">
                            <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
                              {prod.currency?.toUpperCase() || 'USD'} {prod.price}
                            </span>
                            <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded uppercase">
                              {prod.interval}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newProducts.length === 0 && missingProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Everything is in sync!
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedNewProducts.size > 0 && (
                  <span className="mr-4">Import: {selectedNewProducts.size}</span>
                )}
                {selectedMissingProducts.size > 0 && (
                  <span>Delete: {selectedMissingProducts.size}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Skip
                </button>
                <button
                  onClick={handleApplySync}
                  disabled={selectedNewProducts.size === 0 && selectedMissingProducts.size === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
