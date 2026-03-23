export type UserPlan = "free" | "pro";
export type TargetType = "boolean" | "count" | "duration";
export type FrequencyType = "daily" | "weekly" | "custom";
export type MoodType = "great" | "good" | "okay" | "bad" | "terrible";
export type NotificationType = "reminder" | "achievement" | "system";

export interface IUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  timezone: string;
  plan: UserPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  color: string;
  icon: string;
  targetType: TargetType;
  targetValue: number;
  frequencyType: FrequencyType;
  frequencyDays?: number[];
  reminderTime?: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabitLog {
  id: string;
  userId: string;
  habitId: string;
  date: string;
  completed: boolean;
  value: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface IJournalEntry {
  id: string;
  userId: string;
  date: string;
  mood?: MoodType;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitWithStats extends IHabit {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  isCompletedToday: boolean;
  todayLog?: IHabitLog;
  isDueToday: boolean;
}

export interface DashboardData {
  todayHabits: HabitWithStats[];
  completedToday: number;
  pendingToday: number;
  overallCurrentStreak: number;
  overallLongestStreak: number;
  overallCompletionRate: number;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  habitId: string;
  habitTitle: string;
  habitColor: string;
  date: string;
  completed: boolean;
  value: number;
}

export interface WeeklyData {
  week: string;
  completed: number;
  total: number;
  rate: number;
}

export interface HabitBreakdownItem {
  habitId: string;
  title: string;
  color: string;
  completionRate: number;
  currentStreak: number;
  totalCompleted: number;
}

export interface AnalyticsSummary {
  overallCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalHabitsTracked: number;
  totalCompletions: number;
  bestDayOfWeek: string;
  weeklyData: WeeklyData[];
  habitBreakdown: HabitBreakdownItem[];
}

export interface ActionResult<T = void> {
  data?: T;
  error?: string;
}
