export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface FollowUpItem {
  id: string;
  contact: string; // Person / Company (e.g. "Supplier", "Acme Corp")
  action: string;  // e.g. "Send invoice", "Confirm delivery"
  completed?: boolean;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD format
  goal: string; // "What's the ONE most important result I want today?"
  topTasks: TaskItem[]; // exactly 3 items
  otherTasks: TaskItem[]; // 3 initial items, dynamic
  followUps: FollowUpItem[]; // 2-3 initial items, dynamic
  doneToday: boolean | null; // Yes / No / null
  tomorrowTask: string; // "TOMORROW'S #1 TASK"
  productivityScore: number | null; // 1 - 10
  completedAt?: string; // ISO string if marked complete
  notes?: string;
}

export type ActiveTab = 'today' | 'history' | 'settings';

export interface AppSettings {
  handwritingFont: boolean; // toggle marker font vs crisp sans
  carryForwardPending: boolean; // suggest carrying forward unfinished tasks
  defaultFollowUpTemplates: string[];
}
