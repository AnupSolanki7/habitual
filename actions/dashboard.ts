"use server";

import { format, subDays } from "date-fns";
import { connectDB } from "@/lib/db";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateCompletionRate,
  isHabitDueOn,
} from "@/lib/habits";
import { generateDailyReminders } from "@/lib/notifications";
import type { IHabit, IHabitLog, HabitWithStats, DashboardData } from "@/types";

function toPlainHabit(doc: any): IHabit {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    title: doc.title,
    description: doc.description,
    category: doc.category,
    color: doc.color,
    icon: doc.icon,
    targetType: doc.targetType,
    targetValue: doc.targetValue,
    frequencyType: doc.frequencyType,
    frequencyDays: doc.frequencyDays,
    reminderTime: doc.reminderTime,
    archived: doc.archived,
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

export async function getDashboardData(userId: string): Promise<DashboardData> {
  await connectDB();

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const startDate = format(subDays(today, 30), "yyyy-MM-dd");

  // Trigger reminders (fire and forget)
  generateDailyReminders(userId).catch(console.error);

  const habits = await Habit.find({ userId, archived: false }).lean();
  const plainHabits = habits.map(toPlainHabit);

  const logs = await HabitLog.find({
    userId,
    date: { $gte: startDate },
  })
    .sort({ date: -1 })
    .lean();
  const plainLogs = logs.map(toPlainLog);

  const logsByHabit = new Map<string, IHabitLog[]>();
  const todayLogsByHabit = new Map<string, IHabitLog>();

  for (const log of plainLogs) {
    if (!logsByHabit.has(log.habitId)) logsByHabit.set(log.habitId, []);
    logsByHabit.get(log.habitId)!.push(log);
    if (log.date === todayStr) todayLogsByHabit.set(log.habitId, log);
  }

  const todayHabits: HabitWithStats[] = plainHabits
    .filter((h) => isHabitDueOn(h, today))
    .map((habit) => {
      const habitLogs = logsByHabit.get(habit.id) ?? [];
      const todayLog = todayLogsByHabit.get(habit.id);
      return {
        ...habit,
        currentStreak: calculateCurrentStreak(habit, habitLogs),
        longestStreak: calculateLongestStreak(habit, habitLogs),
        completionRate: calculateCompletionRate(habit, habitLogs, 30),
        isCompletedToday: todayLog?.completed ?? false,
        todayLog,
        isDueToday: true,
      };
    });

  const completedToday = todayHabits.filter((h) => h.isCompletedToday).length;
  const pendingToday = todayHabits.filter((h) => !h.isCompletedToday).length;

  const overallCurrentStreak =
    todayHabits.length > 0
      ? Math.max(...todayHabits.map((h) => h.currentStreak))
      : 0;
  const overallLongestStreak =
    todayHabits.length > 0
      ? Math.max(...todayHabits.map((h) => h.longestStreak))
      : 0;
  const overallCompletionRate =
    todayHabits.length > 0
      ? Math.round(
          todayHabits.reduce((sum, h) => sum + h.completionRate, 0) /
            todayHabits.length
        )
      : 0;

  // Recent activity: last 5 completed logs
  const recentActivity = plainLogs
    .filter((l) => l.completed)
    .slice(0, 5)
    .map((l) => {
      const habit = plainHabits.find((h) => h.id === l.habitId);
      return {
        habitId: l.habitId,
        habitTitle: habit?.title ?? "Unknown",
        habitColor: habit?.color ?? "#6366f1",
        date: l.date,
        completed: l.completed,
        value: l.value,
      };
    });

  return {
    todayHabits,
    completedToday,
    pendingToday,
    overallCurrentStreak,
    overallLongestStreak,
    overallCompletionRate,
    recentActivity,
  };
}
