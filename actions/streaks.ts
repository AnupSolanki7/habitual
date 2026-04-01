"use server";

import { format, subDays } from "date-fns";
import { connectDB } from "@/lib/db";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  isHabitDueOn,
} from "@/lib/habits";
import {
  getUnlockedAchievements,
  type UserAchievementStats,
} from "@/lib/achievements";
import { MIN_SHARE_STREAK } from "@/constants";
import type {
  ActionResult,
  ShareableData,
  HabitStreakInfo,
  IHabit,
  IHabitLog,
} from "@/types";

// ─── Internal serialisers (no export — avoids "use server" export restriction) ─

function toPlainHabit(doc: any): IHabit {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    title: doc.title,
    description: doc.description,
    category: doc.category ?? "Other",
    color: doc.color ?? "#6366f1",
    icon: doc.icon ?? "target",
    targetType: doc.targetType,
    targetValue: doc.targetValue,
    frequencyType: doc.frequencyType,
    frequencyDays: doc.frequencyDays,
    reminderTime: doc.reminderTime,
    archived: doc.archived ?? false,
    visibility: doc.visibility ?? "private",
    adoptionCount: doc.adoptionCount ?? 0,
    copiedFromHabitId: doc.copiedFromHabitId?.toString(),
    copiedFromUserId: doc.copiedFromUserId?.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toPlainLog(doc: any): IHabitLog {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    habitId: doc.habitId.toString(),
    date: doc.date,
    completed: doc.completed,
    value: doc.value,
    note: doc.note,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ─── Core stats computation (reused by createPost validation) ──────────────────

export async function computeAchievementStats(
  userId: string
): Promise<UserAchievementStats> {
  await connectDB();
  const today = new Date();
  const startDate = format(subDays(today, 120), "yyyy-MM-dd");

  const [habits, logs] = await Promise.all([
    Habit.find({ userId, archived: false }).lean(),
    HabitLog.find({ userId, date: { $gte: startDate } }).lean(),
  ]);

  const plainHabits = habits.map(toPlainHabit);
  const plainLogs = logs.map(toPlainLog);

  // Group logs by habit
  const logsByHabit = new Map<string, IHabitLog[]>();
  for (const log of plainLogs) {
    if (!logsByHabit.has(log.habitId)) logsByHabit.set(log.habitId, []);
    logsByHabit.get(log.habitId)!.push(log);
  }

  let maxCurrentStreak = 0;
  let maxLongestStreak = 0;
  for (const habit of plainHabits) {
    const habitLogs = logsByHabit.get(habit.id) ?? [];
    const cur = calculateCurrentStreak(habit, habitLogs);
    const lng = calculateLongestStreak(habit, habitLogs);
    if (cur > maxCurrentStreak) maxCurrentStreak = cur;
    if (lng > maxLongestStreak) maxLongestStreak = lng;
  }

  const totalCompletions = plainLogs.filter((l) => l.completed).length;

  // Perfect week: every habit that was due each of the last 7 days was completed
  const logsByDate = new Map<string, Set<string>>();
  for (const log of plainLogs) {
    if (!log.completed) continue;
    if (!logsByDate.has(log.date)) logsByDate.set(log.date, new Set());
    logsByDate.get(log.date)!.add(log.habitId);
  }

  let hasPerfectWeek = plainHabits.length > 0;
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dueHabits = plainHabits.filter((h) => isHabitDueOn(h, date));
    if (dueHabits.length === 0) continue;
    const completedSet = logsByDate.get(dateStr) ?? new Set<string>();
    if (!dueHabits.every((h) => completedSet.has(h.id))) {
      hasPerfectWeek = false;
      break;
    }
  }

  return { totalCompletions, maxCurrentStreak, maxLongestStreak, hasPerfectWeek };
}

// ─── Public server action ──────────────────────────────────────────────────────

/**
 * Returns the data needed by PostComposer for validated sharing:
 *  - `streaks`: habits where currentStreak >= MIN_SHARE_STREAK, sorted descending
 *  - `achievements`: every achievement the user has unlocked
 */
export async function getShareableData(
  userId: string
): Promise<ActionResult<ShareableData>> {
  try {
    await connectDB();
    const today = new Date();
    const startDate = format(subDays(today, 120), "yyyy-MM-dd");

    const [habits, logs] = await Promise.all([
      Habit.find({ userId, archived: false }).lean(),
      HabitLog.find({ userId, date: { $gte: startDate } }).lean(),
    ]);

    const plainHabits = habits.map(toPlainHabit);
    const plainLogs = logs.map(toPlainLog);

    const logsByHabit = new Map<string, IHabitLog[]>();
    for (const log of plainLogs) {
      if (!logsByHabit.has(log.habitId)) logsByHabit.set(log.habitId, []);
      logsByHabit.get(log.habitId)!.push(log);
    }

    // Per-habit stats
    const habitInfos: HabitStreakInfo[] = plainHabits.map((habit) => {
      const habitLogs = logsByHabit.get(habit.id) ?? [];
      return {
        habitId: habit.id,
        title: habit.title,
        category: habit.category,
        color: habit.color,
        currentStreak: calculateCurrentStreak(habit, habitLogs),
        longestStreak: calculateLongestStreak(habit, habitLogs),
        totalCompletions: habitLogs.filter((l) => l.completed).length,
      };
    });

    // Only expose habits with a qualifying streak
    const streaks = habitInfos
      .filter((h) => h.currentStreak >= MIN_SHARE_STREAK)
      .sort((a, b) => b.currentStreak - a.currentStreak);

    // Achievement stats (reuse the same data, avoid a second DB round-trip)
    let maxCurrentStreak = 0;
    let maxLongestStreak = 0;
    for (const h of habitInfos) {
      if (h.currentStreak > maxCurrentStreak) maxCurrentStreak = h.currentStreak;
      if (h.longestStreak > maxLongestStreak) maxLongestStreak = h.longestStreak;
    }
    const totalCompletions = plainLogs.filter((l) => l.completed).length;

    const logsByDate = new Map<string, Set<string>>();
    for (const log of plainLogs) {
      if (!log.completed) continue;
      if (!logsByDate.has(log.date)) logsByDate.set(log.date, new Set());
      logsByDate.get(log.date)!.add(log.habitId);
    }

    let hasPerfectWeek = plainHabits.length > 0;
    for (let i = 0; i < 7; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dueHabits = plainHabits.filter((h) => isHabitDueOn(h, date));
      if (dueHabits.length === 0) continue;
      const completedSet = logsByDate.get(dateStr) ?? new Set<string>();
      if (!dueHabits.every((h) => completedSet.has(h.id))) {
        hasPerfectWeek = false;
        break;
      }
    }

    const achievements = getUnlockedAchievements({
      totalCompletions,
      maxCurrentStreak,
      maxLongestStreak,
      hasPerfectWeek,
    });

    return { data: { streaks, achievements } };
  } catch (err: any) {
    console.error("[getShareableData]", err);
    return { error: "Failed to load shareable data." };
  }
}
