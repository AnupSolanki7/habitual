import { format } from "date-fns";
import { connectDB } from "@/lib/db";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import Notification from "@/models/Notification";
import { isHabitDueOn } from "@/lib/habits";

export async function generateDailyReminders(userId: string): Promise<void> {
  await connectDB();

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // Check if we already generated reminders today
  const existingReminder = await Notification.findOne({
    userId,
    type: "reminder",
    createdAt: {
      $gte: new Date(todayStr),
      $lt: new Date(new Date(todayStr).getTime() + 86400000),
    },
  });

  if (existingReminder) return; // Already generated today

  // Get all active habits due today
  const habits = await Habit.find({ userId, archived: false }).lean();
  const dueHabits = habits.filter((h: any) =>
    isHabitDueOn(
      {
        id: h._id.toString(),
        userId: h.userId.toString(),
        title: h.title,
        description: h.description,
        category: h.category,
        color: h.color,
        icon: h.icon,
        targetType: h.targetType,
        targetValue: h.targetValue,
        frequencyType: h.frequencyType,
        frequencyDays: h.frequencyDays,
        reminderTime: h.reminderTime,
        archived: h.archived,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
        visibility: h.visibility,
        adoptionCount: h.adoptionCount,
      },
      today
    )
  );

  if (dueHabits.length === 0) return;

  // Get today's logs
  const todayLogs = await HabitLog.find({
    userId,
    date: todayStr,
    completed: true,
  }).lean();

  const completedHabitIds = new Set(
    todayLogs.map((l: any) => l.habitId.toString())
  );

  const pendingHabits = dueHabits.filter(
    (h: any) => !completedHabitIds.has(h._id.toString())
  );

  if (pendingHabits.length === 0) return;

  // Create a single daily summary notification
  await Notification.create({
    userId,
    type: "reminder",
    title: "Daily Habit Reminder",
    message:
      pendingHabits.length === 1
        ? `Don't forget: "${(pendingHabits[0] as any).title}" is pending today.`
        : `You have ${pendingHabits.length} habits pending today. Keep up the streak!`,
    read: false,
    metadata: {
      pendingCount: pendingHabits.length,
      pendingHabits: pendingHabits.map((h: any) => ({
        id: h._id.toString(),
        title: h.title,
      })),
    },
  });
}
