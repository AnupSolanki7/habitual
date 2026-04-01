import mongoose, { Document, Schema, Types } from "mongoose";

export interface IGroupMemberDocument extends Document {
    groupId: Types.ObjectId;
    userId: Types.ObjectId;
    role: "admin" | "member";
    joinedAt: Date;
}

const GroupMemberSchema = new Schema<IGroupMemberDocument>(
    {
        groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["admin", "member"], default: "member" },
    },
    { timestamps: { createdAt: "joinedAt", updatedAt: false } }
);

GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
GroupMemberSchema.index({ userId: 1 });

export default mongoose.models.GroupMember ||
    mongoose.model<IGroupMemberDocument>("GroupMember", GroupMemberSchema);
