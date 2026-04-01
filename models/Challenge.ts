import mongoose, { Document, Schema } from "mongoose";

export interface IChallengeDocument extends Document {
    title: string;
    description: string;
    durationDays: number; // e.g. 7 or 30
    isActive: boolean;
    participantCount: number;
    createdAt: Date;
}

const ChallengeSchema = new Schema<IChallengeDocument>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        durationDays: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
        participantCount: { type: Number, default: 0 },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.Challenge ||
    mongoose.model<IChallengeDocument>("Challenge", ChallengeSchema);
