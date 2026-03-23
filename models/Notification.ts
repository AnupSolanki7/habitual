import mongoose, { Document, Schema, Types } from "mongoose";

export interface INotificationDocument extends Document {
  userId: Types.ObjectId;
  type: "reminder" | "achievement" | "system";
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["reminder", "achievement", "system"],
      default: "reminder",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model<INotificationDocument>("Notification", NotificationSchema);
