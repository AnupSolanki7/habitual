import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const UpdateProfileSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1, "Name is required").max(100).trim().optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-z0-9_]+$/, "Username may only contain letters, numbers, and underscores")
    .toLowerCase()
    .optional()
    .or(z.literal("")),
  bio: z.string().max(200, "Bio must be under 200 characters").optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isPublic: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { userId, name, username, bio, image, isPublic } = parsed.data;

    await connectDB();

    // Enforce username uniqueness before saving
    if (username) {
      const taken = await User.exists({
        username,
        _id: { $ne: userId },
      });
      if (taken) {
        return NextResponse.json(
          { error: "Username is already taken." },
          { status: 409 }
        );
      }
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (username !== undefined) updates.username = username || undefined;
    if (bio !== undefined) updates.bio = bio;
    if (image !== undefined) updates.image = image || undefined;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    await User.findByIdAndUpdate(userId, updates);

    return NextResponse.json({ message: "Profile updated." });
  } catch (err) {
    console.error("[PATCH /api/settings/profile]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
