import mongoose, { Document, Schema, Types } from "mongoose";

export interface IChallengeParticipantDocument extends Document {
    challengeId: Types.ObjectId;
    userId: Types.ObjectId;
    progress: number;
    completedDays: number[];
    joinedAt: Date;
}

const ChallengeParticipantSchema = new Schema<IChallengeParticipantDocument>(
    {
        challengeId: { type: Schema.Types.ObjectId, ref: "Challenge", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        progress: { type: Number, default: 0 },
        completedDays: [{ type: Number }], // array of day indexes or timestamps
    },
    { timestamps: { createdAt: "joinedAt", updatedAt: false } }
);

ChallengeParticipantSchema.index({ challengeId: 1, userId: 1 }, { unique: true });

export default mongoose.models.ChallengeParticipant ||
    mongoose.model<IChallengeParticipantDocument>("ChallengeParticipant", ChallengeParticipantSchema);
