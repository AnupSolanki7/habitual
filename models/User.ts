import mongoose, { Document, Schema } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  // Social profile fields
  username?: string;
  bio?: string;
  isPublic: boolean;
  followersCount: number;
  followingCount: number;
  // Original fields
  timezone: string;
  plan: "free" | "pro";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    image: { type: String },
    // Social profile fields
    username: {
      type: String,
      unique: true,
      sparse: true, // only enforce uniqueness when set (existing users without username are unaffected)
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]{3,30}$/, "Username must be 3-30 characters: letters, numbers, underscores only"],
    },
    bio: { type: String, maxlength: 200, trim: true },
    isPublic: { type: Boolean, default: true },
    followersCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
    // Original fields
    timezone: { type: String, default: "UTC" },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUserDocument>("User", UserSchema);
