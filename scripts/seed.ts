/**
 * Seed script — populates the database with a demo user and sample habits.
 * Run with: npm run seed
 * Requires MONGODB_URI in .env.local
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load env manually for script context
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set. Create .env.local first.");
  process.exit(1);
}

// Inline schemas to avoid Next.js module issues in script context
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    image: String,
    timezone: { type: String, default: "UTC" },
    plan: { type: String, default: "free" },
  },
  { timestamps: true }
);

const HabitSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    category: String,
    color: String,
    icon: String,
    targetType: String,
    targetValue: Number,
    frequencyType: String,
    frequencyDays: [Number],
    reminderTime: String,
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const HabitLogSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    habitId: mongoose.Schema.Types.ObjectId,
    date: String,
    completed: Boolean,
    value: Number,
    note: String,
  },
  { timestamps: true }
);

const NotificationSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    title: String,
    message: String,
    read: { type: Boolean, default: false },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const JournalEntrySchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    date: String,
    mood: String,
    note: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Habit = mongoose.model("Habit", HabitSchema);
const HabitLog = mongoose.model("HabitLog", HabitLogSchema);
const Notification = mongoose.model("Notification", NotificationSchema);
const JournalEntry = mongoose.model("JournalEntry", JournalEntrySchema);

function dateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

async function seed() {
  console.log("🌱  Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("✅  Connected.");

  // Clean up existing seed data
  await User.deleteOne({ email: "demo@Habi2ual.app" });

  // Create demo user
  const password = await bcrypt.hash("demo1234", 12);
  const user = await User.create({
    name: "Alex Demo",
    email: "demo@Habi2ual.app",
    password,
    timezone: "UTC",
    plan: "free",
  });

  const userId = user._id;
  console.log(`👤  Created demo user: demo@Habi2ual.app / demo1234`);

  // Create habits
  const habitsData = [
    {
      userId,
      title: "Morning Run",
      description: "30-minute outdoor run to start the day",
      category: "Fitness",
      color: "#ef4444",
      icon: "activity",
      targetType: "duration",
      targetValue: 30,
      frequencyType: "daily",
      reminderTime: "07:00",
    },
    {
      userId,
      title: "Read",
      description: "Read at least 20 pages of a book",
      category: "Learning",
      color: "#6366f1",
      icon: "book",
      targetType: "count",
      targetValue: 20,
      frequencyType: "daily",
      reminderTime: "21:00",
    },
    {
      userId,
      title: "Meditate",
      description: "10-minute mindfulness meditation",
      category: "Mindfulness",
      color: "#8b5cf6",
      icon: "heart",
      targetType: "boolean",
      targetValue: 1,
      frequencyType: "daily",
      reminderTime: "08:00",
    },
  ];

  const habits = await Habit.insertMany(habitsData);
  console.log(`📋  Created ${habits.length} habits`);

  // Generate logs for the past 30 days
  const logs: any[] = [];

  for (const habit of habits) {
    for (let i = 0; i < 30; i++) {
      // Randomize completion: 70-90% rate with some variance
      const threshold = habit.title === "Meditate" ? 0.85 : habit.title === "Morning Run" ? 0.70 : 0.80;
      const completed = Math.random() < threshold;
      const value = habit.targetType === "boolean"
        ? (completed ? 1 : 0)
        : habit.targetType === "duration"
        ? (completed ? (habit.targetValue as number) + Math.floor(Math.random() * 10 - 5) : Math.floor(Math.random() * (habit.targetValue as number) * 0.5))
        : (completed ? (habit.targetValue as number) : Math.floor(Math.random() * (habit.targetValue as number)));

      logs.push({
        userId,
        habitId: habit._id,
        date: dateString(i),
        completed,
        value: Math.max(0, value),
        note: completed && i % 7 === 0 ? "Felt great today!" : undefined,
      });
    }
  }

  await HabitLog.insertMany(logs);
  console.log(`📊  Created ${logs.length} habit logs`);

  // Create a welcome notification
  await Notification.create({
    userId,
    type: "system",
    title: "Welcome to Habi2ual! 🎉",
    message: "You've successfully set up your account. Start tracking habits to build your streak.",
    read: false,
  });

  // Create a sample journal entry for today
  await JournalEntry.create({
    userId,
    date: dateString(0),
    mood: "good",
    note: "Today was a productive day. Hit my reading goal and had a solid run.",
  });

  console.log("📓  Created sample journal entry and notification");
  console.log("\n✅  Seeding complete!");
  console.log("   Email:    demo@Habi2ual.app");
  console.log("   Password: demo1234");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
