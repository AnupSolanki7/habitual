import mongoose, { Document, Schema, Types } from "mongoose";

export type PostType = "text" | "streak" | "achievement" | "habit_share";
export type PostVisibility = "followers" | "public";

export interface IPostDocument extends Document {
  userId: Types.ObjectId;
  type: PostType;
  content: string;
  habitId?: Types.ObjectId;
  streakCount?: number;
  visibility: PostVisibility;
  metadata?: Record<string, unknown>;
  // Denormalised reaction counters for fast rendering
  likesCount: number;
  fireCount: number;
  clapCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPostDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["text", "streak", "achievement", "habit_share"],
      default: "text",
    },
    content: { type: String, required: true, maxlength: 1000, trim: true },
    habitId: { type: Schema.Types.ObjectId, ref: "Habit" },
    streakCount: { type: Number },
    visibility: {
      type: String,
      enum: ["followers", "public"],
      default: "followers",
    },
    metadata: { type: Schema.Types.Mixed },
    likesCount: { type: Number, default: 0, min: 0 },
    fireCount:  { type: Number, default: 0, min: 0 },
    clapCount:  { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Feed queries — newest posts from a set of user IDs
PostSchema.index({ userId: 1, createdAt: -1 });
// Public discovery
PostSchema.index({ visibility: 1, createdAt: -1 });

export default mongoose.models.Post ||
  mongoose.model<IPostDocument>("Post", PostSchema);
