import mongoose, { Document, Schema, Types } from "mongoose";

export type NotificationType =
  | "reminder"
  | "achievement"
  | "system"
  // Social notification types (Phase 1+)
  | "new_follower"
  | "post_liked"
  | "post_commented"
  | "habit_adopted"
  | "streak_milestone";

export interface INotificationDocument extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  // Social relation fields
  relatedUserId?: Types.ObjectId;
  relatedPostId?: Types.ObjectId;
  relatedHabitId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "reminder",
        "achievement",
        "system",
        "new_follower",
        "post_liked",
        "post_commented",
        "habit_adopted",
        "streak_milestone",
      ],
      default: "reminder",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedUserId: { type: Schema.Types.ObjectId, ref: "User" },
    relatedPostId: { type: Schema.Types.ObjectId },
    relatedHabitId: { type: Schema.Types.ObjectId, ref: "Habit" },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model<INotificationDocument>("Notification", NotificationSchema);
