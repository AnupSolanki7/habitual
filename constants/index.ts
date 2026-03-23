export const FREE_PLAN_HABIT_LIMIT = 3;

export const HABIT_CATEGORIES = [
  { value: "Health", label: "Health" },
  { value: "Fitness", label: "Fitness" },
  { value: "Learning", label: "Learning" },
  { value: "Work", label: "Work" },
  { value: "Mindfulness", label: "Mindfulness" },
  { value: "Social", label: "Social" },
  { value: "Finance", label: "Finance" },
  { value: "Other", label: "Other" },
];

export const HABIT_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#64748b", // slate
];

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sun", fullLabel: "Sunday" },
  { value: 1, label: "Mon", fullLabel: "Monday" },
  { value: 2, label: "Tue", fullLabel: "Tuesday" },
  { value: 3, label: "Wed", fullLabel: "Wednesday" },
  { value: 4, label: "Thu", fullLabel: "Thursday" },
  { value: 5, label: "Fri", fullLabel: "Friday" },
  { value: 6, label: "Sat", fullLabel: "Saturday" },
];

export const MOOD_OPTIONS: Array<{ value: string; label: string; emoji: string }> = [
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "bad", label: "Bad", emoji: "😕" },
  { value: "terrible", label: "Terrible", emoji: "😞" },
];

export const DEFAULT_REMINDER_TIME = "08:00";

export const TARGET_TYPES = [
  { value: "boolean", label: "Yes / No" },
  { value: "count", label: "Count" },
  { value: "duration", label: "Duration (min)" },
];

export const FREQUENCY_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom days" },
];
