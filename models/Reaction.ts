import mongoose, { Document, Schema, Types } from "mongoose";

export type ReactionType = "like" | "fire" | "clap";

export interface IReactionDocument extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  type: ReactionType;
  createdAt: Date;
}

const ReactionSchema = new Schema<IReactionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    type: {
      type: String,
      enum: ["like", "fire", "clap"],
      required: true,
    },
  },
  { timestamps: true }
);

// One reaction per user per post (type can change — handled in action via upsert)
ReactionSchema.index({ userId: 1, postId: 1 }, { unique: true });
ReactionSchema.index({ postId: 1 });

export default mongoose.models.Reaction ||
  mongoose.model<IReactionDocument>("Reaction", ReactionSchema);
