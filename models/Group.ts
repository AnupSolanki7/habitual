import mongoose, { Document, Schema, Types } from "mongoose";

export interface IGroupDocument extends Document {
    name: string;
    description?: string;
    ownerId: Types.ObjectId;
    isPublic: boolean;
    memberCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const GroupSchema = new Schema<IGroupDocument>(
    {
        name: { type: String, required: true, trim: true, unique: true },
        description: { type: String, trim: true, maxlength: 300 },
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isPublic: { type: Boolean, default: true },
        memberCount: { type: Number, default: 1 },
    },
    { timestamps: true }
);

export default mongoose.models.Group ||
    mongoose.model<IGroupDocument>("Group", GroupSchema);
