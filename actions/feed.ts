"use server";

import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Follow from "@/models/Follow";
import Reaction, { IReactionDocument } from "@/models/Reaction";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getFeed(page = 1, limit = 20) {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const currentUserId = session.user.id;

    const following = await Follow.find({ followerId: currentUserId }).select("followingId");
    const followingIds = following.map((f: any) => f.followingId);

    const feedUserIds = [...followingIds, currentUserId];

    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId: { $in: feedUserIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name username image")
        .lean();

    // Get current user's reactions for these posts
    const postIds = posts.map(p => p._id);
    const userReactions = await Reaction.find({
        userId: currentUserId,
        postId: { $in: postIds }
    }).lean();

    const reactionMap = userReactions.reduce((acc: Record<string, string>, r: any) => {
        acc[r.postId.toString()] = r.type;
        return acc;
    }, {});

    return posts.map((p: any) => ({
        ...p,
        _id: p._id.toString(),
        userId: {
            ...p.userId,
            _id: p.userId._id.toString()
        },
        userReaction: reactionMap[p._id.toString()] || null
    }));
}

export async function toggleReaction(postId: string, type: "like" | "fire" | "clap") {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) throw new Error("Unauthorized");

    const currentUserId = session.user.id;

    const existingReaction = await Reaction.findOne({
        userId: currentUserId,
        postId
    });

    if (existingReaction) {
        if (existingReaction.type === type) {
            // Remove reaction
            await Reaction.deleteOne({ _id: existingReaction._id });
            await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
            return { action: "removed", type };
        } else {
            // Change reaction
            existingReaction.type = type;
            await existingReaction.save();
            return { action: "changed", type };
        }
    } else {
        // Add new reaction
        await Reaction.create({
            userId: currentUserId,
            postId,
            type
        });
        const updatedPost = await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } }).lean();

        // Create Notification if it's not their own post
        if (updatedPost && updatedPost.userId.toString() !== currentUserId) {
            const currentUser = await User.findById(currentUserId).select("name");
            const emoji = type === "fire" ? "🔥" : type === "clap" ? "👏" : "👍";
            await Notification.create({
                userId: updatedPost.userId,
                type: "post_liked",
                title: "New Reaction",
                message: `${currentUser?.name || "Someone"} reacted ${emoji} to your post.`,
                metadata: { postId, reactorId: currentUserId }
            });
        }

        return { action: "added", type };
    }
}
