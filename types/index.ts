// ─── Primitive types ──────────────────────────────────────────────────────────
export type TargetType    = "boolean" | "count" | "duration";
export type FrequencyType = "daily" | "weekly" | "custom";
export type MoodType      = "great" | "good" | "okay" | "bad" | "terrible";
export type HabitVisibility = "private" | "public";

export type NotificationType =
  | "reminder"
  | "achievement"
  | "system"
  | "new_follower"
  | "post_liked"
  | "post_commented"
  | "habit_adopted"
  | "streak_milestone";

export type PostType = "text" | "streak" | "achievement" | "habit_share";
export type PostVisibility = "followers" | "public";
export type ReactionType = "like" | "fire" | "clap";

// ─── Core domain interfaces ───────────────────────────────────────────────────

export interface IUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  username?: string;
  bio?: string;
  isPublic: boolean;
  followersCount: number;
  followingCount: number;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Lightweight shape used on social surfaces */
export interface IUserPublic {
  id: string;
  name: string;
  username?: string;
  image?: string;
  bio?: string;
  isPublic: boolean;
  followersCount: number;
  followingCount: number;
}

export interface IFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
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
  visibility: HabitVisibility;
  adoptionCount: number;
  copiedFromHabitId?: string;
  copiedFromUserId?: string;
  createdAt: Date;
  updatedAt: Date;
  isAdoptedByCurrentUser?: boolean; // server-computed property for public habits
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
  relatedUserId?: string;
  relatedPostId?: string;
  relatedHabitId?: string;
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

// ─── Social interfaces ────────────────────────────────────────────────────────

export interface IPost {
  id: string;
  userId: string;
  type: PostType;
  content: string;
  habitId?: string;
  streakCount?: number;
  visibility: PostVisibility;
  metadata?: Record<string, unknown>;
  likesCount: number;
  fireCount: number;
  clapCount: number;
  commentsCount: number;
  /** Populated author (present when fetched with populate) */
  author?: {
    id: string;
    name: string;
    username?: string;
    image?: string;
  };
  /** Populated habit reference */
  habitRef?: {
    id: string;
    title: string;
    category: string;
    color: string;
  };
  /** The logged-in viewer's current reaction to this post, if any */
  viewerReaction?: ReactionType;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReaction {
  id: string;
  userId: string;
  postId: string;
  type: ReactionType;
  createdAt: Date;
}

export interface IComment {
  id: string;
  userId: string;
  postId: string;
  text: string;
  author?: {
    id: string;
    name: string;
    username?: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ─── Compound / computed interfaces ──────────────────────────────────────────

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

export interface IProfileStats {
  totalHabits: number;
  publicHabits: number;
  currentStreak: number;
  longestStreak: number;
  followersCount: number;
  followingCount: number;
}

export interface ActionResult<T = void> {
  data?: T;
  error?: string;
}

// ─── Habit Templates ──────────────────────────────────────────────────────────

export interface IHabitTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  color: string;
  targetType: TargetType;
  targetValue: number;
  frequencyType: FrequencyType;
  frequencyDays?: number[];
}

// ─── Validated Social Sharing ─────────────────────────────────────────────────

/** A single achievement the user has unlocked */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

/** Per-habit streak info used in the social post composer */
export interface HabitStreakInfo {
  habitId: string;
  title: string;
  category: string;
  color: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
}

/** What the composer fetches from the server before letting user share */
export interface ShareableData {
  /** Only habits where currentStreak >= MIN_SHARE_STREAK (3) */
  streaks: HabitStreakInfo[];
  achievements: Achievement[];
}
