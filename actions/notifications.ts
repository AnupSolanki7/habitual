"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { generateDailyReminders } from "@/lib/notifications";
import type { INotification, ActionResult } from "@/types";

function toPlainNotification(doc: any): INotification {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    type: doc.type,
    title: doc.title,
    message: doc.message,
    read: doc.read,
    metadata: doc.metadata,
    createdAt: doc.createdAt,
  };
}

export async function getNotifications(
  userId: string,
  limit = 20
): Promise<INotification[]> {
  await connectDB();
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return notifications.map(toPlainNotification);
}

export async function getUnreadCount(userId: string): Promise<number> {
  await connectDB();
  return Notification.countDocuments({ userId, read: false });
}

export async function markAsRead(
  userId: string,
  notificationId: string
): Promise<ActionResult> {
  try {
    await connectDB();
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true }
    );
    revalidatePath("/notifications");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function markAllAsRead(userId: string): Promise<ActionResult> {
  try {
    await connectDB();
    await Notification.updateMany({ userId, read: false }, { read: true });
    revalidatePath("/notifications");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<ActionResult> {
  try {
    await connectDB();
    await Notification.findOneAndDelete({ _id: notificationId, userId });
    revalidatePath("/notifications");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function triggerDailyReminders(userId: string): Promise<void> {
  try {
    await generateDailyReminders(userId);
  } catch (err) {
    console.error("Failed to generate reminders:", err);
  }
}
