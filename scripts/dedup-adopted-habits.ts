/**
 * One-time migration: remove duplicate adopted habits.
 *
 * A duplicate is any (userId, copiedFromHabitId) pair that appears more than
 * once. We keep the oldest document (lowest _id / earliest createdAt) and
 * archive the rest so data is never hard-deleted.
 *
 * Run once before the unique index is applied:
 *   npx ts-node -P tsconfig.json scripts/dedup-adopted-habits.ts
 *
 * After a clean run you can safely apply the compound unique index in Habit.ts.
 */

import mongoose from "mongoose";
import Habit from "../models/Habit";

const MONGO_URI = process.env.MONGODB_URI ?? "";

async function main() {
  if (!MONGO_URI) throw new Error("MONGODB_URI env var is not set");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Find all (userId, copiedFromHabitId) groups with more than one document
  const duplicates = await Habit.aggregate([
    {
      $match: {
        copiedFromHabitId: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: { userId: "$userId", copiedFromHabitId: "$copiedFromHabitId" },
        ids: { $push: "$_id" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  if (duplicates.length === 0) {
    console.log("No duplicates found. Safe to apply unique index.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${duplicates.length} duplicate group(s). Archiving extras…`);

  let archivedTotal = 0;

  for (const group of duplicates) {
    // Sort ids ascending — keep the first (oldest) one
    const sorted: mongoose.Types.ObjectId[] = group.ids.sort(
      (a: mongoose.Types.ObjectId, b: mongoose.Types.ObjectId) =>
        a.toString().localeCompare(b.toString())
    );
    const [_keep, ...extras] = sorted;

    const result = await Habit.updateMany(
      { _id: { $in: extras } },
      { $set: { archived: true } }
    );
    archivedTotal += result.modifiedCount;
    console.log(
      `  userId=${group._id.userId} copiedFrom=${group._id.copiedFromHabitId} → archived ${result.modifiedCount} duplicate(s)`
    );
  }

  console.log(`Done. Archived ${archivedTotal} duplicate habit(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
