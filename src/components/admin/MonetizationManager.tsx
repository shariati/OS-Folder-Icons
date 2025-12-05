'use client';

import React, { useState, useEffect } from 'react';
import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { Plan } from '@/types/plan';
import { Plus, Edit, Trash, Save, X, Check } from 'lucide-react';
import { AdSettings } from './AdSettings';

export function MonetizationManager() {
  const [activeTab, setActiveTab] = useState<'plans' | 'ads'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);

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
      }
    } catch (error) {
      console.error('Failed to save plan', error);
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
    <div className="space-y-6">
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
                    placeholder="price_..."
                  />
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
    </div>
  );
}
