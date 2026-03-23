"use server";

import { revalidatePath } from "next/cache";
import { format, subDays } from "date-fns";
import { connectDB } from "@/lib/db";
import HabitLog from "@/models/HabitLog";
import type { IHabitLog, ActionResult } from "@/types";

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

export async function getTodayLogs(userId: string): Promise<IHabitLog[]> {
  await connectDB();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const logs = await HabitLog.find({ userId, date: todayStr }).lean();
  return logs.map(toPlainLog);
}

export async function logHabit(
  userId: string,
  habitId: string,
  data: { completed: boolean; value?: number; note?: string }
): Promise<ActionResult<IHabitLog>> {
  try {
    await connectDB();
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const log = await HabitLog.findOneAndUpdate(
      { habitId, date: todayStr },
      { userId, habitId, date: todayStr, ...data },
      { upsert: true, new: true }
    ).lean();

    revalidatePath("/dashboard");
    revalidatePath(`/habits/${habitId}`);
    return { data: toPlainLog(log) };
  } catch (err: any) {
    return { error: err.message || "Failed to log habit" };
  }
}

export async function getLogsForHabit(
  userId: string,
  habitId: string,
  days = 30
): Promise<IHabitLog[]> {
  await connectDB();
  const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");
  const logs = await HabitLog.find({
    userId,
    habitId,
    date: { $gte: startDate },
  })
    .sort({ date: -1 })
    .lean();
  return logs.map(toPlainLog);
}

export async function updateLog(
  userId: string,
  logId: string,
  data: Partial<{ completed: boolean; value: number; note: string }>
): Promise<ActionResult<IHabitLog>> {
  try {
    await connectDB();
    const log = await HabitLog.findOneAndUpdate(
      { _id: logId, userId },
      data,
      { new: true }
    ).lean();
    if (!log) return { error: "Log not found" };
    revalidatePath("/dashboard");
    return { data: toPlainLog(log) };
  } catch (err: any) {
    return { error: err.message || "Failed to update log" };
  }
}
