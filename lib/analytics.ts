import {
  startOfDay,
  subDays,
  format,
  getDay,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { connectDB } from "@/lib/db";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import {
  isHabitDueOn,
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateCompletionRate,
} from "@/lib/habits";
import type {
  IHabit,
  IHabitLog,
  AnalyticsSummary,
  WeeklyData,
  HabitBreakdownItem,
} from "@/types";

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

export async function getWeeklyCompletionData(
  userId: string,
  weeks = 8
): Promise<WeeklyData[]> {
  await connectDB();

  const today = startOfDay(new Date());
  const startDate = subDays(today, weeks * 7);

  const [habits, logs] = await Promise.all([
    Habit.find({ userId, archived: false }).lean(),
    HabitLog.find({
      userId,
      date: { $gte: format(startDate, "yyyy-MM-dd") },
    }).lean(),
  ]);

  const plainHabits = habits.map(toPlainHabit);
  const logsByDate = new Map<string, IHabitLog[]>();

  logs.forEach((log: any) => {
    const l = toPlainLog(log);
    if (!logsByDate.has(l.date)) logsByDate.set(l.date, []);
    logsByDate.get(l.date)!.push(l);
  });

  const weekIntervals = eachWeekOfInterval(
    { start: startDate, end: today },
    { weekStartsOn: 1 }
  );

  const weeklyData: WeeklyData[] = weekIntervals.slice(-weeks).map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({
      start: weekStart,
      end: weekEnd > today ? today : weekEnd,
    });

    let totalDue = 0;
    let totalCompleted = 0;

    for (const day of daysInWeek) {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayLogs = logsByDate.get(dateStr) ?? [];
      const logMap = new Map(dayLogs.map((l) => [l.habitId, l]));

      for (const habit of plainHabits) {
        if (isHabitDueOn(habit, day)) {
          totalDue++;
          const log = logMap.get(habit.id);
          if (log?.completed) totalCompleted++;
        }
      }
    }

    return {
      week: format(weekStart, "MMM d"),
      completed: totalCompleted,
      total: totalDue,
      rate: totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 0,
    };
  });

  return weeklyData;
}

export async function getBestDayOfWeek(userId: string): Promise<string> {
  await connectDB();

  const startDate = subDays(new Date(), 90);
  const logs = await HabitLog.find({
    userId,
    completed: true,
    date: { $gte: format(startDate, "yyyy-MM-dd") },
  }).lean();

  const dayCount = new Array(7).fill(0);

  logs.forEach((log: any) => {
    const dayOfWeek = getDay(new Date(log.date));
    dayCount[dayOfWeek]++;
  });

  const maxIndex = dayCount.indexOf(Math.max(...dayCount));
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayNames[maxIndex];
}

export async function getHabitCompletionBreakdown(
  userId: string
): Promise<HabitBreakdownItem[]> {
  await connectDB();

  const habits = await Habit.find({ userId, archived: false }).lean();
  const startDate = subDays(new Date(), 30);

  const breakdown: HabitBreakdownItem[] = [];

  for (const habitDoc of habits) {
    const habit = toPlainHabit(habitDoc);
    const logs = await HabitLog.find({
      habitId: habit.id,
      date: { $gte: format(startDate, "yyyy-MM-dd") },
    }).lean();

    const plainLogs = logs.map(toPlainLog);
    const totalCompleted = plainLogs.filter((l) => l.completed).length;
    const completionRate = calculateCompletionRate(habit, plainLogs, 30);
    const currentStreak = calculateCurrentStreak(habit, plainLogs);

    breakdown.push({
      habitId: habit.id,
      title: habit.title,
      color: habit.color,
      completionRate,
      currentStreak,
      totalCompleted,
    });
  }

  return breakdown.sort((a, b) => b.completionRate - a.completionRate);
}

export async function getAnalyticsSummary(
  userId: string
): Promise<AnalyticsSummary> {
  await connectDB();

  const habits = await Habit.find({ userId, archived: false }).lean();
  const startDate = subDays(new Date(), 30);

  let totalCompletionRates = 0;
  let maxCurrentStreak = 0;
  let maxLongestStreak = 0;
  let totalCompletions = 0;

  for (const habitDoc of habits) {
    const habit = toPlainHabit(habitDoc);
    const logs = await HabitLog.find({
      habitId: habit.id,
      date: { $gte: format(startDate, "yyyy-MM-dd") },
    }).lean();
    const plainLogs = logs.map(toPlainLog);

    const completionRate = calculateCompletionRate(habit, plainLogs, 30);
    const currentStreak = calculateCurrentStreak(habit, plainLogs);
    const longestStreak = calculateLongestStreak(habit, plainLogs);
    const completed = plainLogs.filter((l) => l.completed).length;

    totalCompletionRates += completionRate;
    maxCurrentStreak = Math.max(maxCurrentStreak, currentStreak);
    maxLongestStreak = Math.max(maxLongestStreak, longestStreak);
    totalCompletions += completed;
  }

  const overallCompletionRate =
    habits.length > 0
      ? Math.round(totalCompletionRates / habits.length)
      : 0;

  const [weeklyData, habitBreakdown, bestDayOfWeek] = await Promise.all([
    getWeeklyCompletionData(userId),
    getHabitCompletionBreakdown(userId),
    getBestDayOfWeek(userId),
  ]);

  return {
    overallCompletionRate,
    currentStreak: maxCurrentStreak,
    longestStreak: maxLongestStreak,
    totalHabitsTracked: habits.length,
    totalCompletions,
    bestDayOfWeek,
    weeklyData,
    habitBreakdown,
  };
}
