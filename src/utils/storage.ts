import { DayPlan, AppSettings, TaskItem, FollowUpItem } from '../types';

const STORAGE_KEY_PREFIX = 'my_daily_plan_days_v1';
const SETTINGS_KEY = 'my_daily_plan_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  handwritingFont: false,
  carryForwardPending: true,
  defaultFollowUpTemplates: [
    'Supplier follow-up',
    'Customer follow-up',
    'Payment follow-up',
    'Order follow-up',
    'Logistics / Shipping',
  ],
};

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function createEmptyDayPlan(dateStr: string): DayPlan {
  return {
    date: dateStr,
    goal: '',
    topTasks: [
      { id: generateId(), text: '', completed: false },
      { id: generateId(), text: '', completed: false },
      { id: generateId(), text: '', completed: false },
    ],
    otherTasks: [
      { id: generateId(), text: '', completed: false },
      { id: generateId(), text: '', completed: false },
      { id: generateId(), text: '', completed: false },
    ],
    followUps: [
      { id: generateId(), contact: '', action: '', completed: false },
      { id: generateId(), contact: '', action: '', completed: false },
    ],
    doneToday: null,
    tomorrowTask: '',
    productivityScore: null,
  };
}

export function getTodayDateString(): string {
  // Use user's local date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function shiftDateString(dateStr: string, daysOffset: number): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + daysOffset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

// Retrieve all saved dates
export function getAllSavedDates(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEY_PREFIX}:`)) {
        keys.push(key.replace(`${STORAGE_KEY_PREFIX}:`, ''));
      }
    }
    return keys.sort().reverse();
  } catch (e) {
    console.error('Failed to read saved dates from localStorage', e);
    return [];
  }
}

// Load a single day
export function loadDayPlan(dateStr: string): DayPlan {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}:${dateStr}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure structure invariants: 3 top tasks
      const topTasks: TaskItem[] = Array.isArray(parsed.topTasks)
        ? parsed.topTasks.slice(0, 3)
        : [];
      while (topTasks.length < 3) {
        topTasks.push({ id: generateId(), text: '', completed: false });
      }

      return {
        date: dateStr,
        goal: parsed.goal || '',
        topTasks,
        otherTasks: Array.isArray(parsed.otherTasks) ? parsed.otherTasks : [],
        followUps: Array.isArray(parsed.followUps) ? parsed.followUps : [],
        doneToday: typeof parsed.doneToday === 'boolean' ? parsed.doneToday : null,
        tomorrowTask: parsed.tomorrowTask || '',
        productivityScore: typeof parsed.productivityScore === 'number' ? parsed.productivityScore : null,
        completedAt: parsed.completedAt,
        notes: parsed.notes,
      };
    }
  } catch (e) {
    console.error('Error loading day plan from localStorage', e);
  }

  return createEmptyDayPlan(dateStr);
}

// Save a single day
export function saveDayPlan(plan: DayPlan): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}:${plan.date}`, JSON.stringify(plan));
  } catch (e) {
    console.error('Error saving day plan to localStorage', e);
  }
}

// Load all plans for History
export function loadAllPlans(): DayPlan[] {
  const dates = getAllSavedDates();
  return dates.map((d) => loadDayPlan(d));
}

// Delete a day plan
export function deleteDayPlan(dateStr: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}:${dateStr}`);
  } catch (e) {
    console.error('Error deleting day plan', e);
  }
}

// Settings
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

// Progress calculation
export function calculateProgress(plan: DayPlan): {
  topDone: number;
  topTotal: number;
  totalDone: number;
  totalCount: number;
  percent: number;
} {
  const topActive = plan.topTasks.filter((t) => t.text.trim().length > 0);
  const topDone = topActive.filter((t) => t.completed).length;
  const topTotal = topActive.length > 0 ? topActive.length : 3; // base 3 top tasks

  const otherActive = plan.otherTasks.filter((t) => t.text.trim().length > 0);
  const otherDone = otherActive.filter((t) => t.completed).length;

  const totalDone = topDone + otherDone;
  const totalCount = topActive.length + otherActive.length;

  const percent = totalCount > 0 ? Math.round((totalDone / totalCount) * 100) : 0;

  return {
    topDone,
    topTotal: topActive.length,
    totalDone,
    totalCount,
    percent,
  };
}

// Initialize seed data if new installation
export function initializeSampleDataIfEmpty(): void {
  const dates = getAllSavedDates();
  if (dates.length === 0) {
    const today = getTodayDateString();
    const yesterday = shiftDateString(today, -1);

    // Seed yesterday as completed
    const yesterdayPlan: DayPlan = {
      date: yesterday,
      goal: 'Finalize Q3 supplier agreements & order batch inventory',
      topTasks: [
        { id: generateId(), text: 'Review revised quotation from primary packaging supplier', completed: true },
        { id: generateId(), text: 'Approve batch #104 PO and authorize wire payment', completed: true },
        { id: generateId(), text: 'Sync with logistics freight agent on customs ETA', completed: true },
      ],
      otherTasks: [
        { id: generateId(), text: 'Update product listing photos for fall campaign', completed: true },
        { id: generateId(), text: 'Check pending Stripe merchant payouts', completed: true },
      ],
      followUps: [
        { id: generateId(), contact: 'Apex Packaging (Lin)', action: 'Confirm container dispatch date', completed: true },
        { id: generateId(), contact: 'Wholesale client #12', action: 'Send revised invoice copy', completed: true },
      ],
      doneToday: true,
      tomorrowTask: 'Launch new product listings and dispatch sample kits',
      productivityScore: 9,
      completedAt: new Date(Date.now() - 86400000).toISOString(),
    };

    // Seed today with practical items matching user's business execution example
    const todayPlan: DayPlan = {
      date: today,
      goal: 'Launch new product listings and dispatch sample kits',
      topTasks: [
        { id: generateId(), text: 'Audit Amazon & Shopify product listings for live launch', completed: true },
        { id: generateId(), text: 'Dispatch 12 VIP retail sample boxes to courier', completed: false },
        { id: generateId(), text: 'Review daily ad spend budget and ROAS metrics', completed: false },
      ],
      otherTasks: [
        { id: generateId(), text: 'Reconcile supplier payment receipt #883', completed: false },
        { id: generateId(), text: 'Update weekly inventory velocity spreadsheet', completed: false },
        { id: generateId(), text: 'Archive answered customer support tickets', completed: true },
      ],
      followUps: [
        { id: generateId(), contact: 'Supplier (Apex)', action: 'Confirm tracking code for air shipment', completed: false },
        { id: generateId(), contact: 'Finance Dept', action: 'Release pending wire clearance', completed: true },
      ],
      doneToday: null,
      tomorrowTask: '',
      productivityScore: null,
    };

    saveDayPlan(yesterdayPlan);
    saveDayPlan(todayPlan);
  }
}
