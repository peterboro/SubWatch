import React, { useEffect, useState } from 'react';
import { Subscription, Category } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { generateSavingsTips } from '../services/geminiService';

interface Props {
  subscriptions: Subscription[];
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

export const Analytics: React.FC<Props> = ({ subscriptions }) => {
  const [tips, setTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);

  // 1. Spend by Category
  const categoryData = Object.values(Category).map(cat => {
    const total = subscriptions
        .filter(s => s.category === cat)
        .reduce((acc, s) => acc + s.amount, 0); // Simplified calculation assuming monthly normalized for chart
    return { name: cat, value: total };
  }).filter(d => d.value > 0);

  // 2. Monthly Projected Spend (Mocked for 6 months)
  const currentMonth = new Date().getMonth();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth + i) % 12;
    // Simple projection: just sum up all monthly costs
    const total = subscriptions.reduce((acc, sub) => {
        // Very basic logic: if yearly, only add if it falls in this month (mock logic)
        // For visual, just showing average monthly load
        let cost = sub.amount;
        if (sub.billingCycle === 'Yearly') cost = sub.amount / 12;
        return acc + cost;
    }, 0);
    return { name: monthNames[monthIndex], spend: parseFloat(total.toFixed(2)) };
  });

  useEffect(() => {
    if (subscriptions.length > 0) {
        setLoadingTips(true);
        generateSavingsTips(subscriptions).then(t => {
            setTips(t);
            setLoadingTips(false);
        });
    }
  }, [subscriptions]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Spending Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Spend by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
           <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Projected Monthly Spend</h3>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} prefix="$" />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="spend" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>

      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            AI Financial Insights
        </h3>
        {loadingTips ? (
            <div className="flex space-x-2 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
        ) : (
            <div className="grid md:grid-cols-3 gap-4">
                {tips.map((tip, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                        <p className="text-sm font-medium">{tip}</p>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
