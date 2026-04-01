import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { followUser, unfollowUser } from "@/actions/social";

const FollowSchema = z.object({
  followingId: z.string().min(1, "Target user ID is required"),
});

/** POST /api/follow — follow a user */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const followerId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const parsed = FollowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const result = await followUser(followerId, parsed.data.followingId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Followed." }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/follow]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** DELETE /api/follow — unfollow a user */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const followerId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const parsed = FollowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const result = await unfollowUser(followerId, parsed.data.followingId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Unfollowed." });
  } catch (err) {
    console.error("[DELETE /api/follow]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
