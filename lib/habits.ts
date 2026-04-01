import {
  startOfDay,
  subDays,
  eachDayOfInterval,
  format,
  getDay,
} from "date-fns";
import type { IHabit, IHabitLog } from "@/types";

/** Returns true if a habit is due on the given date */
export function isHabitDueOn(habit: IHabit, date: Date): boolean {
  if (habit.archived) return false;
  const dayOfWeek = getDay(date); // 0=Sun ... 6=Sat

  switch (habit.frequencyType) {
    case "daily":
      return true;
    case "weekly":
      // Weekly habits are due every day (user tracks once per week)
      // Simplified: treat as daily for MVP
      return true;
    case "custom":
      return habit.frequencyDays?.includes(dayOfWeek) ?? false;
    default:
      return true;
  }
}

/** Calculate current streak: consecutive days (from today backward) where habit was completed */
export function calculateCurrentStreak(
  habit: IHabit,
  logs: IHabitLog[]
): number {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  );

  let streak = 0;
  let checkDate = startOfDay(new Date());

  // If today is not completed, start from yesterday
  const todayStr = format(checkDate, "yyyy-MM-dd");
  if (!completedDates.has(todayStr)) {
    checkDate = subDays(checkDate, 1);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = format(checkDate, "yyyy-MM-dd");
    if (!isHabitDueOn(habit, checkDate)) {
      // Skip non-due days without breaking streak
      checkDate = subDays(checkDate, 1);
      continue;
    }
    if (completedDates.has(dateStr)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  return streak;
}

/** Calculate the longest streak ever */
export function calculateLongestStreak(
  habit: IHabit,
  logs: IHabitLog[]
): number {
  if (logs.length === 0) return 0;

  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  );

  // Get date range from first log to today
  const sortedDates = Array.from(completedDates).sort();
  if (sortedDates.length === 0) return 0;

  const firstDate = new Date(sortedDates[0]);
  const today = new Date();
  const allDays = eachDayOfInterval({ start: firstDate, end: today });

  let longestStreak = 0;
  let currentStreak = 0;

  for (const day of allDays) {
    if (!isHabitDueOn(habit, day)) continue;
    const dateStr = format(day, "yyyy-MM-dd");
    if (completedDates.has(dateStr)) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}

/** Calculate completion percentage for the last N days */
export function calculateCompletionRate(
  habit: IHabit,
  logs: IHabitLog[],
  days = 30
): number {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  );

  const today = startOfDay(new Date());
  let dueDays = 0;
  let completedCount = 0;

  for (let i = 0; i < days; i++) {
    const checkDate = subDays(today, i);
    if (!isHabitDueOn(habit, checkDate)) continue;
    dueDays++;
    const dateStr = format(checkDate, "yyyy-MM-dd");
    if (completedDates.has(dateStr)) completedCount++;
  }

  if (dueDays === 0) return 0;
  return Math.round((completedCount / dueDays) * 100);
}
