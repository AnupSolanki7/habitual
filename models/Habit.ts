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
  },
  { timestamps: true }
);

HabitSchema.index({ userId: 1, archived: 1 });

export default mongoose.models.Habit ||
  mongoose.model<IHabitDocument>("Habit", HabitSchema);
