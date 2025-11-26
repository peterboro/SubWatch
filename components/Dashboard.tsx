import React from 'react';
import { Subscription, BillingCycle, Category } from '../types';
import { CreditCard, AlertCircle, RefreshCw, Search } from './Icons';
import { SubscriptionCard } from './SubscriptionCard';

interface DashboardProps {
  subscriptions: Subscription[];
  onScan: () => void;
  isScanning: boolean;
  onSelectSubscription: (sub: Subscription) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ subscriptions, onScan, isScanning, onSelectSubscription }) => {
  const [filter, setFilter] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('All');

  // Calculations
  const totalMonthly = subscriptions.reduce((acc, sub) => {
    let monthlyCost = sub.amount;
    if (sub.billingCycle === BillingCycle.Yearly) monthlyCost = sub.amount / 12;
    if (sub.billingCycle === BillingCycle.Weekly) monthlyCost = sub.amount * 4;
    return acc + monthlyCost;
  }, 0);

  const upcomingRenewals = subscriptions
    .filter(s => new Date(s.nextRenewalDate) > new Date())
    .sort((a, b) => new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime())
    .slice(0, 3);

  const filteredSubs = subscriptions.filter(sub => {
    const matchesText = sub.serviceName.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || sub.category === categoryFilter;
    return matchesText && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's your financial overview.</p>
        </div>
        <button
          onClick={onScan}
          disabled={isScanning}
          className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all ${isScanning ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning Inbox...' : 'Scan for New Subs'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Spend</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">${totalMonthly.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <div className="w-6 h-6 font-bold flex items-center justify-center">{subscriptions.length}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Subs</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{subscriptions.length} Services</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Next Renewal</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                {upcomingRenewals[0] ? upcomingRenewals[0].serviceName : 'None'}
              </h3>
              <p className="text-xs text-slate-500">
                {upcomingRenewals[0] ? new Date(upcomingRenewals[0].nextRenewalDate).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Subscriptions</h2>
            
            <div className="flex gap-2">
                 <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                 </div>
                 <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                    <option value="All">All Categories</option>
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
            </div>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredSubs.length > 0 ? (
            filteredSubs.map(sub => (
              <SubscriptionCard key={sub.id} subscription={sub} onClick={() => onSelectSubscription(sub)} />
            ))
          ) : (
             <div className="p-8 text-center text-slate-500">
                No subscriptions found matching your filters.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
