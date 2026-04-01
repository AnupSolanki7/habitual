"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Follow from "@/models/Follow";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getProfileByUsername(username: string) {
    await connectDB();
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    const user = await User.findOne({ username: username.toLowerCase() })
        .select("name username image bio followingCount followersCount longestStreak isPublic")
        .lean() as any;

    if (!user) {
        return null;
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== user._id.toString()) {
        const follow = await Follow.findOne({
            followerId: currentUserId,
            followingId: user._id,
        });
        isFollowing = !!follow;
    }

    return {
        ...user,
        _id: user._id.toString(),
        isFollowing,
        isSelf: currentUserId === user._id.toString(),
    };
}

export async function toggleFollow(targetUserId: string) {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const currentUserId = session.user.id;

    if (currentUserId === targetUserId) {
        throw new Error("Cannot follow yourself");
    }

    const existingFollow = await Follow.findOne({
        followerId: currentUserId,
        followingId: targetUserId,
    });

    if (existingFollow) {
        // Unfollow
        await Follow.deleteOne({ _id: existingFollow._id });
        await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });
        await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
    } else {
        // Follow
        await Follow.create({
            followerId: currentUserId,
            followingId: targetUserId,
        });
        const currentUser = await User.findById(currentUserId).select("name username");
        await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });
        await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });

        // Create Notification
        if (currentUser) {
            await Notification.create({
                userId: targetUserId,
                type: "new_follower",
                title: "New Follower",
                message: `${currentUser.name} (@${currentUser.username}) started following you!`,
                metadata: { followerId: currentUserId }
            });
        }
    }

    revalidatePath("/u/[username]", "page");
    revalidatePath("/social");

    return { success: true, following: !existingFollow };
}
