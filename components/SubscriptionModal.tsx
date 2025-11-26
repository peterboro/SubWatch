import React, { useState } from 'react';
import { Subscription } from '../types';
import { DEFAULT_LOGO } from '../constants';
import { generateUnsubscribeEmail } from '../services/geminiService';

interface Props {
  subscription: Subscription;
  onClose: () => void;
  onDelete: (id: string) => void;
  userEmail?: string;
}

export const SubscriptionModal: React.FC<Props> = ({ subscription, onClose, onDelete, userEmail }) => {
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);

  const handleGenerateUnsubscribe = async () => {
    setGeneratingEmail(true);
    const draft = await generateUnsubscribeEmail(subscription, userEmail || 'Valued Customer');
    setEmailDraft(draft);
    setGeneratingEmail(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
            <div className="flex items-center gap-4">
                <img 
                    src={subscription.logoUrl || DEFAULT_LOGO} 
                    alt={subscription.serviceName}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO }}
                />
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{subscription.serviceName}</h2>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded text-xs font-semibold uppercase tracking-wide">
                        {subscription.category}
                    </span>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cost</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {subscription.currency} {subscription.amount.toFixed(2)}
                        <span className="text-sm font-normal text-slate-500 ml-1">/{subscription.billingCycle}</span>
                    </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Renews On</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {new Date(subscription.nextRenewalDate).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {subscription.description && (
                <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Plan Details</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{subscription.description}</p>
                </div>
            )}

            {/* Unsubscribe Logic */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Management</h4>
                
                {!emailDraft ? (
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleGenerateUnsubscribe}
                            disabled={generatingEmail}
                            className="w-full py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {generatingEmail ? 'Generating...' : 'Help Me Unsubscribe'}
                        </button>
                        <a 
                            href={`https://google.com/search?q=cancel ${subscription.serviceName}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full py-3 px-4 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg font-medium text-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Find Cancellation Page
                        </a>
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                             <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300">Draft Email</h5>
                             <button 
                                onClick={() => { navigator.clipboard.writeText(emailDraft); alert('Copied to clipboard'); }}
                                className="text-xs text-indigo-600 hover:underline"
                             >
                                Copy Text
                             </button>
                        </div>
                        <textarea 
                            readOnly 
                            value={emailDraft}
                            className="w-full h-32 text-sm bg-transparent border-none resize-none focus:ring-0 text-slate-600 dark:text-slate-400 font-mono"
                        />
                         <a 
                            href={`mailto:support@${subscription.serviceName.toLowerCase()}.com?subject=Cancellation Request&body=${encodeURIComponent(emailDraft)}`}
                            className="mt-2 block w-full py-2 bg-indigo-600 text-white text-center rounded text-sm hover:bg-indigo-700"
                        >
                            Open in Email Client
                        </a>
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-400">
            <span>Detected via Gmail</span>
            <button 
                onClick={() => { onDelete(subscription.id); onClose(); }}
                className="text-red-500 hover:text-red-600"
            >
                Remove from list
            </button>
        </div>

      </div>
    </div>
  );
};
