import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFollowDocument extends Document {
  followerId: Types.ObjectId; // the user who is following
  followingId: Types.ObjectId; // the user being followed
  createdAt: Date;
}

const FollowSchema = new Schema<IFollowDocument>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followingId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate follows
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
// Efficient look-ups from either direction
FollowSchema.index({ followingId: 1, createdAt: -1 });
FollowSchema.index({ followerId: 1, createdAt: -1 });

export default mongoose.models.Follow ||
  mongoose.model<IFollowDocument>("Follow", FollowSchema);
