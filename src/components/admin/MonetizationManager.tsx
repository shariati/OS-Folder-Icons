'use client';

import React, { useState, useEffect } from 'react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { Plan } from '@/types/plan';
import { Plus, Edit, Trash, Save, X, Check, Download } from 'lucide-react';
import { AdSettings } from './AdSettings';

export function MonetizationManager() {
  const [activeTab, setActiveTab] = useState<'plans' | 'ads'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importableProducts, setImportableProducts] = useState<any[]>([]);
  const [loadingImport, setLoadingImport] = useState(false);

  useEffect(() => {
    fetchPlans();
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

  const fetchStripeProducts = async () => {
    setLoadingImport(true);
    try {
        const res = await fetch('/api/admin/plans/stripe-products');
        const data = await res.json();
        if (Array.isArray(data)) {
            setImportableProducts(data);
        }
    } catch (error) {
        console.error('Failed to fetch Stripe products', error);
    } finally {
        setLoadingImport(false);
    }
  };

  const handleOpenImport = () => {
      setShowImportModal(true);
      fetchStripeProducts();
  };

  const handleImportSelect = (product: any) => {
      setEditingPlan({
          name: product.productName,
          description: product.productDescription || '',
          price: product.amount,
          currency: product.currency,
          interval: product.interval,
          features: [],
          stripePriceId: product.id,
          type: product.type,
          active: true,
      });
      setShowImportModal(false);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      const method = editingPlan.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/plans', {
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
      await fetch('/api/admin/plans', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete plan', error);
    }
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
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Manage Plans</h3>
            <div className="flex gap-2">
                <button
                    onClick={handleOpenImport}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Download size={16} />
                    Import from Stripe
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Import from Stripe</h3>
                    <button onClick={() => setShowImportModal(false)}>
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {loadingImport ? (
                        <div className="text-center py-12">Loading Stripe products...</div>
                    ) : importableProducts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No actionable products found in Stripe that aren't already in the dashboard.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {importableProducts.map((prod) => (
                                <div key={prod.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div>
                                        <h4 className="font-bold">{prod.productName}</h4>
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
                                    <button 
                                        onClick={() => handleImportSelect(prod)}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        Import
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
