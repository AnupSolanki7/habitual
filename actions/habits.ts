"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import User from "@/models/User";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateCompletionRate,
  isHabitDueOn,
} from "@/lib/habits";
import { FREE_PLAN_HABIT_LIMIT } from "@/constants";
import type { IHabit, HabitWithStats, ActionResult } from "@/types";
import { format, subDays } from "date-fns";

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
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getHabits(userId: string): Promise<IHabit[]> {
  await connectDB();
  const habits = await Habit.find({ userId, archived: false })
    .sort({ createdAt: -1 })
    .lean();
  return habits.map(toPlainHabit);
}

export async function getAllHabits(userId: string): Promise<IHabit[]> {
  await connectDB();
  const habits = await Habit.find({ userId }).sort({ createdAt: -1 }).lean();
  return habits.map(toPlainHabit);
}

export async function getHabitById(
  userId: string,
  habitId: string
): Promise<IHabit | null> {
  await connectDB();
  const habit = await Habit.findOne({ _id: habitId, userId }).lean();
  if (!habit) return null;
  return toPlainHabit(habit);
}

export async function createHabit(
  userId: string,
  data: Omit<IHabit, "id" | "userId" | "archived" | "createdAt" | "updatedAt">
): Promise<ActionResult<IHabit>> {
  try {
    await connectDB();

    // Check plan limits
    const user = await User.findById(userId).lean();
    if (!user) return { error: "User not found" };

    if ((user as any).plan === "free") {
      const activeCount = await Habit.countDocuments({
        userId,
        archived: false,
      });
      if (activeCount >= FREE_PLAN_HABIT_LIMIT) {
        return {
          error: `Free plan is limited to ${FREE_PLAN_HABIT_LIMIT} active habits. Upgrade to Pro for unlimited habits.`,
        };
      }
    }

    const habit = await Habit.create({ userId, ...data });
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    return { data: toPlainHabit(habit.toObject()) };
  } catch (err: any) {
    return { error: err.message || "Failed to create habit" };
  }
}

export async function updateHabit(
  userId: string,
  habitId: string,
  data: Partial<Omit<IHabit, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<ActionResult<IHabit>> {
  try {
    await connectDB();
    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, userId },
      { ...data },
      { new: true }
    ).lean();
    if (!habit) return { error: "Habit not found" };
    revalidatePath("/habits");
    revalidatePath(`/habits/${habitId}`);
    revalidatePath("/dashboard");
    return { data: toPlainHabit(habit) };
  } catch (err: any) {
    return { error: err.message || "Failed to update habit" };
  }
}

export async function deleteHabit(
  userId: string,
  habitId: string
): Promise<ActionResult> {
  try {
    await connectDB();
    const habit = await Habit.findOneAndDelete({ _id: habitId, userId });
    if (!habit) return { error: "Habit not found" };
    await HabitLog.deleteMany({ habitId });
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    return {};
  } catch (err: any) {
    return { error: err.message || "Failed to delete habit" };
  }
}

export async function archiveHabit(
  userId: string,
  habitId: string,
  archived: boolean
): Promise<ActionResult<IHabit>> {
  return updateHabit(userId, habitId, { archived });
}

export async function getHabitWithStats(
  userId: string,
  habitId: string
): Promise<HabitWithStats | null> {
  await connectDB();
  const habitDoc = await Habit.findOne({ _id: habitId, userId }).lean();
  if (!habitDoc) return null;

  const habit = toPlainHabit(habitDoc);
  const startDate = format(subDays(new Date(), 90), "yyyy-MM-dd");
  const logs = await HabitLog.find({
    habitId,
    date: { $gte: startDate },
  }).lean();

  const plainLogs = logs.map((l: any) => ({
    id: l._id.toString(),
    userId: l.userId.toString(),
    habitId: l.habitId.toString(),
    date: l.date,
    completed: l.completed,
    value: l.value,
    note: l.note,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  }));

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayLog = plainLogs.find((l) => l.date === todayStr);

  return {
    ...habit,
    currentStreak: calculateCurrentStreak(habit, plainLogs),
    longestStreak: calculateLongestStreak(habit, plainLogs),
    completionRate: calculateCompletionRate(habit, plainLogs, 30),
    isCompletedToday: todayLog?.completed ?? false,
    todayLog,
    isDueToday: isHabitDueOn(habit, new Date()),
  };
}
