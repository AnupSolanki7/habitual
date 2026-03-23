"use server";

import {
  getAnalyticsSummary,
  getWeeklyCompletionData,
  getBestDayOfWeek,
  getHabitCompletionBreakdown,
} from "@/lib/analytics";
import type {
  AnalyticsSummary,
  WeeklyData,
  HabitBreakdownItem,
} from "@/types";

export async function fetchAnalyticsSummary(
  userId: string
): Promise<AnalyticsSummary> {
  return getAnalyticsSummary(userId);
}

export async function fetchWeeklyData(userId: string): Promise<WeeklyData[]> {
  return getWeeklyCompletionData(userId);
}

export async function fetchHabitBreakdown(
  userId: string
): Promise<HabitBreakdownItem[]> {
  return getHabitCompletionBreakdown(userId);
}

export async function fetchBestDay(userId: string): Promise<string> {
  return getBestDayOfWeek(userId);
}
