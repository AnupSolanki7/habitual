import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICommentDocument extends Document {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<ICommentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    text: { type: String, required: true, maxlength: 500, trim: true },
  },
  { timestamps: true }
);

CommentSchema.index({ postId: 1, createdAt: 1 });
CommentSchema.index({ userId: 1 });

export default mongoose.models.Comment ||
  mongoose.model<ICommentDocument>("Comment", CommentSchema);
