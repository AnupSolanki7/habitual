import mongoose, { Document, Schema, Types } from "mongoose";

export interface IHabitLogDocument extends Document {
  userId: Types.ObjectId;
  habitId: Types.ObjectId;
  date: string;
  completed: boolean;
  value: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HabitLogSchema = new Schema<IHabitLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    habitId: { type: Schema.Types.ObjectId, ref: "Habit", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    completed: { type: Boolean, default: false },
    value: { type: Number, default: 0 },
    note: { type: String },
  },
  { timestamps: true }
);

HabitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });
HabitLogSchema.index({ userId: 1, date: 1 });

export default mongoose.models.HabitLog ||
  mongoose.model<IHabitLogDocument>("HabitLog", HabitLogSchema);
