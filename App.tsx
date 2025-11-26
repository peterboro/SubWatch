import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, PieChartIcon, LogOut, Settings } from './components/Icons';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { SubscriptionModal } from './components/SubscriptionModal';
import { initGoogleAuth, signInWithGoogle, fetchGmailMessages, getUserProfile } from './services/gmailService';
import { parseEmailToSubscription } from './services/geminiService';
import { Subscription, User, BillingCycle, Category } from './types';
import { MOCK_SUBSCRIPTIONS } from './constants';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for theme
    if (localStorage.getItem('theme') === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Init Google Auth
    initGoogleAuth(async (response) => {
      if (response && response.access_token) {
        try {
          const profile = await getUserProfile();
          setUser({
            name: profile.name,
            email: profile.email,
            avatar: profile.picture
          });
          // Load mocked subs initially, then real scan replaces/adds
          setSubscriptions(MOCK_SUBSCRIPTIONS); 
        } catch (error) {
          console.error("Profile fetch failed", error);
        }
      }
    });
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleScan = async () => {
    if (!user) {
        alert("Please sign in with Google to scan real emails.");
        return;
    }

    setIsScanning(true);
    try {
      const messages = await fetchGmailMessages();
      console.log(`Fetched ${messages.length} potential subscription emails.`);
      
      const newSubs: Subscription[] = [];
      const processedIds = new Set(subscriptions.map(s => s.id));

      // Process messages with Gemini
      // Note: In production, process in batches to avoid rate limits
      for (const msg of messages) {
         // Create a unique deterministic ID based on msg ID
         if (processedIds.has(msg.id)) continue;

         const subData = await parseEmailToSubscription(msg.body, msg.date);
         
         if (subData) {
             const sub: Subscription = {
                 id: msg.id,
                 serviceName: subData.serviceName || 'Unknown Service',
                 amount: subData.amount || 0,
                 currency: subData.currency || 'USD',
                 billingCycle: subData.billingCycle || BillingCycle.Monthly,
                 nextRenewalDate: subData.nextRenewalDate || new Date().toISOString(),
                 category: subData.category || Category.Other,
                 description: subData.description,
                 logoUrl: `https://logo.clearbit.com/${(subData.serviceName || '').toLowerCase().replace(/\s/g, '')}.com`,
                 confidenceScore: subData.confidenceScore
             };
             newSubs.push(sub);
         }
      }

      if (newSubs.length > 0) {
          setSubscriptions(prev => [...prev, ...newSubs]);
          alert(`Found ${newSubs.length} new subscriptions!`);
      } else {
          alert("No new subscriptions detected in recent emails.");
      }

    } catch (error) {
      console.error("Scan failed", error);
      alert("Failed to scan Gmail. Ensure you have granted permissions. (Note: Unverified apps might be blocked by Google in this demo environment).");
    } finally {
      setIsScanning(false);
    }
  };

  const handleLogin = () => {
    signInWithGoogle();
  };

  const handleDemoLogin = () => {
      setUser({
          name: "Demo User",
          email: "demo@example.com",
          avatar: "https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff"
      });
      setSubscriptions(MOCK_SUBSCRIPTIONS);
  }

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-700">
          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">SubWatch AI</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Stop paying for unused subscriptions. Connect your Gmail and let AI find them for you.
          </p>

          <button 
            onClick={handleLogin}
            className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center justify-center gap-3 transition-all mb-4"
          >
             <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
             Sign in with Google
          </button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or try demo</span>
            </div>
          </div>

          <button 
            onClick={handleDemoLogin}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all"
          >
             View Demo Dashboard
          </button>
          
          <p className="mt-6 text-xs text-slate-400">
              By connecting, you agree to allow us to scan email metadata for subscription patterns.
              Data is processed locally/temporarily in this demo.
          </p>
        </div>
      </div>
    );
  }

  // Main App Layout
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col">
        <div className="p-6">
            <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                SubWatch AI
            </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
            <button 
                onClick={() => setView('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
            </button>
            <button 
                onClick={() => setView('analytics')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'analytics' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
                <PieChartIcon className="w-5 h-5" />
                Analytics
            </button>
            <div className="mt-8 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Settings
            </div>
            <button 
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
                {darkMode ? <Settings className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
                <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
            </div>
            <button 
                onClick={() => setUser(null)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
         {/* Mobile Header */}
         <div className="md:hidden bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 z-20">
            <h1 className="font-bold text-indigo-600">SubWatch AI</h1>
            <button onClick={() => setView(view === 'dashboard' ? 'analytics' : 'dashboard')}>
                {view === 'dashboard' ? <PieChartIcon className="w-6 h-6 text-slate-600" /> : <LayoutDashboard className="w-6 h-6 text-slate-600" />}
            </button>
         </div>

         <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {view === 'dashboard' && (
                <Dashboard 
                    subscriptions={subscriptions} 
                    onScan={handleScan} 
                    isScanning={isScanning}
                    onSelectSubscription={setSelectedSub}
                />
            )}
            {view === 'analytics' && (
                <Analytics subscriptions={subscriptions} />
            )}
         </div>
      </main>

      {/* Modal */}
      {selectedSub && (
        <SubscriptionModal 
            subscription={selectedSub} 
            onClose={() => setSelectedSub(null)}
            onDelete={(id) => setSubscriptions(prev => prev.filter(s => s.id !== id))}
            userEmail={user.email}
        />
      )}
    </div>
  );
};

export default App;