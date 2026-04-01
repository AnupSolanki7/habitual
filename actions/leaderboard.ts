"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Follow from "@/models/Follow";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getLeaderboard(scope: "friends" | "global" = "friends") {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) throw new Error("Unauthorized");

    const currentUserId = session.user.id;
    let targetUserIds: string[] = [];

    if (scope === "friends") {
        const following = await Follow.find({ followerId: currentUserId }).select("followingId");
        targetUserIds = following.map((f: any) => f.followingId);
        targetUserIds.push(currentUserId);
    }

    const query = scope === "friends" ? { _id: { $in: targetUserIds } } : { isPublic: true };

    const users = await User.find(query)
        .sort({ longestStreak: -1 })
        .limit(10)
        .select("name username image longestStreak isPublic")
        .lean();

    return users.map((u: any, index: number) => ({
        ...u,
        _id: u._id.toString(),
        rank: index + 1,
        isSelf: u._id.toString() === currentUserId
    }));
}
