import mongoose, { Document, Schema, Types } from "mongoose";

export interface IJournalEntryDocument extends Document {
  userId: Types.ObjectId;
  date: string;
  mood?: "great" | "good" | "okay" | "bad" | "terrible";
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    mood: { type: String, enum: ["great", "good", "okay", "bad", "terrible"] },
    note: { type: String },
  },
  { timestamps: true }
);

JournalEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.JournalEntry ||
  mongoose.model<IJournalEntryDocument>("JournalEntry", JournalEntrySchema);
