import React from 'react';
import { Subscription } from '../types';
import { ChevronRight } from './Icons';
import { DEFAULT_LOGO } from '../constants';

interface Props {
  subscription: Subscription;
  onClick: () => void;
}

export const SubscriptionCard: React.FC<Props> = ({ subscription, onClick }) => {
  const daysUntilRenewal = Math.ceil((new Date(subscription.nextRenewalDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const isUrgent = daysUntilRenewal <= 3 && daysUntilRenewal >= 0;

  return (
    <div 
        onClick={onClick}
        className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 dark:border-slate-600">
            <img 
                src={subscription.logoUrl || DEFAULT_LOGO} 
                alt={subscription.serviceName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO }}
            />
        </div>
        <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">{subscription.serviceName}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">{subscription.category}</span>
                <span>•</span>
                <span>{subscription.billingCycle}</span>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
            <p className="font-bold text-slate-900 dark:text-white">
                {subscription.currency === 'USD' ? '$' : subscription.currency} {subscription.amount.toFixed(2)}
            </p>
            <p className={`text-xs ${isUrgent ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                {daysUntilRenewal > 0 ? `Renews in ${daysUntilRenewal} days` : 'Renewed recently'}
            </p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </div>
  );
};
