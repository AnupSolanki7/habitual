import mongoose, { Document, Schema, Types } from "mongoose";

export interface IHabitDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  color: string;
  icon: string;
  targetType: "boolean" | "count" | "duration";
  targetValue: number;
  frequencyType: "daily" | "weekly" | "custom";
  frequencyDays?: number[];
  reminderTime?: string;
  archived: boolean;
  // Social fields
  visibility: "private" | "public";
  adoptionCount: number;
  copiedFromHabitId?: Types.ObjectId;
  copiedFromUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabitDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, default: "Other" },
    color: { type: String, default: "#6366f1" },
    icon: { type: String, default: "target" },
    targetType: {
      type: String,
      enum: ["boolean", "count", "duration"],
      default: "boolean",
    },
    targetValue: { type: Number, default: 1 },
    frequencyType: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: "daily",
    },
    frequencyDays: [{ type: Number }],
    reminderTime: { type: String },
    archived: { type: Boolean, default: false },
    // Social fields
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    adoptionCount: { type: Number, default: 0, min: 0 },
    copiedFromHabitId: { type: Schema.Types.ObjectId, ref: "Habit" },
    copiedFromUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

HabitSchema.index({ userId: 1, archived: 1 });
// Prevent the same user from adopting the same public habit more than once.
// sparse: true so the index only covers documents where copiedFromHabitId exists,
// leaving regular (non-adopted) habits unaffected.
HabitSchema.index(
  { userId: 1, copiedFromHabitId: 1 },
  { unique: true, sparse: true }
);

export default mongoose.models.Habit ||
  mongoose.model<IHabitDocument>("Habit", HabitSchema);
