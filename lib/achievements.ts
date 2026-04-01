import type { Achievement } from "@/types";

/** Stats computed from DB that drive achievement checks (pure — no DB calls) */
export interface UserAchievementStats {
  totalCompletions: number;
  maxCurrentStreak: number;
  maxLongestStreak: number;
  hasPerfectWeek: boolean;
}

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** Tailwind gradient colours used on the UI card */
  gradientFrom: string;
  gradientTo: string;
  check: (stats: UserAchievementStats) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_log",
    title: "First Step",
    description: "Completed your first habit",
    emoji: "⭐",
    gradientFrom: "#f59e0b",
    gradientTo: "#f97316",
    check: (s) => s.totalCompletions >= 1,
  },
  {
    id: "streak_3",
    title: "On a Roll",
    description: "3-day streak achieved",
    emoji: "🔥",
    gradientFrom: "#f97316",
    gradientTo: "#ef4444",
    check: (s) => s.maxCurrentStreak >= 3 || s.maxLongestStreak >= 3,
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "7-day streak unlocked",
    emoji: "⚡",
    gradientFrom: "#8b5cf6",
    gradientTo: "#6366f1",
    check: (s) => s.maxLongestStreak >= 7,
  },
  {
    id: "streak_14",
    title: "Two Weeks Strong",
    description: "Kept going for 14 days straight",
    emoji: "💪",
    gradientFrom: "#3b82f6",
    gradientTo: "#6366f1",
    check: (s) => s.maxLongestStreak >= 14,
  },
  {
    id: "streak_30",
    title: "Monthly Master",
    description: "Maintained a 30-day streak",
    emoji: "🌟",
    gradientFrom: "#0ea5e9",
    gradientTo: "#8b5cf6",
    check: (s) => s.maxLongestStreak >= 30,
  },
  {
    id: "streak_100",
    title: "Century Club",
    description: "Reached a legendary 100-day streak",
    emoji: "🏅",
    gradientFrom: "#10b981",
    gradientTo: "#0ea5e9",
    check: (s) => s.maxLongestStreak >= 100,
  },
  {
    id: "completions_10",
    title: "Getting Started",
    description: "Logged 10 habit completions",
    emoji: "✅",
    gradientFrom: "#22c55e",
    gradientTo: "#10b981",
    check: (s) => s.totalCompletions >= 10,
  },
  {
    id: "completions_50",
    title: "Half Century",
    description: "Logged 50 habit completions",
    emoji: "🎯",
    gradientFrom: "#ec4899",
    gradientTo: "#8b5cf6",
    check: (s) => s.totalCompletions >= 50,
  },
  {
    id: "completions_100",
    title: "Centurion",
    description: "100 habit completions achieved",
    emoji: "🏆",
    gradientFrom: "#f59e0b",
    gradientTo: "#ef4444",
    check: (s) => s.totalCompletions >= 100,
  },
  {
    id: "perfect_week",
    title: "Perfect Week",
    description: "Every habit completed for 7 days straight",
    emoji: "👑",
    gradientFrom: "#6366f1",
    gradientTo: "#8b5cf6",
    check: (s) => s.hasPerfectWeek,
  },
];

/** Returns UI-friendly data for each AchievementDef (used in the composer card grid) */
export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENT_DEFS.find((d) => d.id === id);
}

/** Returns the list of achievements the user has unlocked */
export function getUnlockedAchievements(stats: UserAchievementStats): Achievement[] {
  return ACHIEVEMENT_DEFS.filter((def) => def.check(stats)).map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    emoji: def.emoji,
  }));
}

/** Quick boolean check for a single achievement (used in server-side validation) */
export function isAchievementUnlocked(
  id: string,
  stats: UserAchievementStats
): boolean {
  const def = ACHIEVEMENT_DEFS.find((d) => d.id === id);
  return def ? def.check(stats) : false;
}
