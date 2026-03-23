"use server";

import { revalidatePath } from "next/cache";
import { format, subDays } from "date-fns";
import { connectDB } from "@/lib/db";
import JournalEntry from "@/models/JournalEntry";
import type { IJournalEntry, MoodType, ActionResult } from "@/types";

function toPlainEntry(doc: any): IJournalEntry {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    date: doc.date,
    mood: doc.mood,
    note: doc.note,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getJournalEntry(
  userId: string,
  date: string
): Promise<IJournalEntry | null> {
  await connectDB();
  const entry = await JournalEntry.findOne({ userId, date }).lean();
  if (!entry) return null;
  return toPlainEntry(entry);
}

export async function upsertJournalEntry(
  userId: string,
  date: string,
  data: { mood?: MoodType; note?: string }
): Promise<ActionResult<IJournalEntry>> {
  try {
    await connectDB();
    const entry = await JournalEntry.findOneAndUpdate(
      { userId, date },
      { userId, date, ...data },
      { upsert: true, new: true }
    ).lean();
    revalidatePath("/dashboard");
    return { data: toPlainEntry(entry) };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getRecentJournalEntries(
  userId: string,
  limit = 7
): Promise<IJournalEntry[]> {
  await connectDB();
  const startDate = format(subDays(new Date(), limit), "yyyy-MM-dd");
  const entries = await JournalEntry.find({
    userId,
    date: { $gte: startDate },
  })
    .sort({ date: -1 })
    .limit(limit)
    .lean();
  return entries.map(toPlainEntry);
}
