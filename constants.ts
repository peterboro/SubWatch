// This is the user provided Client ID. 
// Note: rigorous Gmail API usage usually requires an app to be verified by Google.
export const GOOGLE_CLIENT_ID = '786193386662-fo9echbl38bgv8eheqlppp9qbpidnvrm.apps.googleusercontent.com';
export const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

export const GEMINI_MODEL_FAST = 'gemini-2.5-flash';

// Fallback images if no logo found
export const DEFAULT_LOGO = 'https://picsum.photos/40/40';

export const MOCK_SUBSCRIPTIONS = [
  {
    id: '1',
    serviceName: 'Netflix',
    amount: 15.49,
    currency: 'USD',
    billingCycle: 'Monthly',
    nextRenewalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Entertainment',
    description: 'Standard Plan',
    logoUrl: 'https://logo.clearbit.com/netflix.com'
  },
  {
    id: '2',
    serviceName: 'Spotify',
    amount: 10.99,
    currency: 'USD',
    billingCycle: 'Monthly',
    nextRenewalDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Entertainment',
    logoUrl: 'https://logo.clearbit.com/spotify.com'
  },
  {
    id: '3',
    serviceName: 'Adobe Creative Cloud',
    amount: 54.99,
    currency: 'USD',
    billingCycle: 'Monthly',
    nextRenewalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'SaaS',
    logoUrl: 'https://logo.clearbit.com/adobe.com'
  },
  {
    id: '4',
    serviceName: 'Amazon Prime',
    amount: 139.00,
    currency: 'USD',
    billingCycle: 'Yearly',
    nextRenewalDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Shopping',
    logoUrl: 'https://logo.clearbit.com/amazon.com'
  }
];