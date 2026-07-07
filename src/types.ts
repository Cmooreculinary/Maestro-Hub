export interface Task {
  id: number;
  title: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  created_at: string;
}

export interface Stats {
  totalTasks: number;
  completedTasks: number;
  totalFocusMinutes: number;
  totalAssets: number;
  vaultFileCount: number;
  upcomingEventsCount: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  category: 'family' | 'golf' | 'finance' | 'general';
  description?: string;
  created_at: string;
}

export interface BankAccount {
  id: number;
  institution: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  account_number: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  date: string;
  merchant: string;
  amount: number;
  category: string;
}

export interface VaultFile {
  id: number;
  name: string;
  size: number;
  category: 'family' | 'finance' | 'golf' | 'general';
  url: string;
  created_at: string;
}

export interface GolfTeeTime {
  id: number;
  players: string;
  date: string;
  time: string;
  course: string;
  status: 'confirmed' | 'pending';
}

export type View = 'dashboard' | 'calendar' | 'wealth' | 'vault' | 'golf' | 'tasks' | 'focus' | 'ai';
