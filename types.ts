export interface User {
  name: string;
  email: string;
  avatar: string;
}

export enum BillingCycle {
  Monthly = 'Monthly',
  Yearly = 'Yearly',
  Weekly = 'Weekly',
  Unknown = 'Unknown'
}

export enum Category {
  Entertainment = 'Entertainment',
  Utilities = 'Utilities',
  SaaS = 'SaaS',
  Business = 'Business',
  Shopping = 'Shopping',
  Health = 'Health',
  Other = 'Other'
}

export interface Subscription {
  id: string;
  serviceName: string;
  description?: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  nextRenewalDate: string; // ISO Date String
  lastPaymentDate?: string;
  category: Category;
  logoUrl?: string;
  merchantEmail?: string;
  cancellationLink?: string;
  confidenceScore?: number; // 0-1 from AI
  isManual?: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface EmailMessage {
  id: string;
  snippet: string;
  body: string;
  date: string;
  from: string;
  subject: string;
}
