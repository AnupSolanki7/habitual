"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Reaction from "@/models/Reaction";
import Comment from "@/models/Comment";
import Follow from "@/models/Follow";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import Notification from "@/models/Notification";
import { calculateCurrentStreak } from "@/lib/habits";
import { computeAchievementStats } from "@/actions/streaks";
import { MIN_SHARE_STREAK } from "@/constants";
import { isAchievementUnlocked } from "@/lib/achievements";
import type { IPost, IComment, IReaction, ActionResult, IHabit, IHabitLog } from "@/types";

// ─── Serialisers ─────────────────────────────────────────────────────────────

function toPlainPost(doc: any, viewerUserId?: string): IPost {
  const author = doc.userId as any;
  return {
    id: doc._id.toString(),
    userId: typeof author === "object" ? author._id.toString() : author.toString(),
    type: doc.type,
    content: doc.content,
    habitId: doc.habitId?.toString(),
    streakCount: doc.streakCount,
    visibility: doc.visibility,
    metadata: doc.metadata,
    likesCount: doc.likesCount ?? 0,
    fireCount: doc.fireCount ?? 0,
    clapCount: doc.clapCount ?? 0,
    commentsCount: doc.commentsCount ?? 0,
    author: typeof author === "object" && author.name
      ? {
          id: author._id.toString(),
          name: author.name,
          username: author.username,
          image: author.image,
        }
      : undefined,
    habitRef: doc.habitId && typeof doc.habitId === "object" && doc.habitId.title
      ? {
          id: doc.habitId._id.toString(),
          title: doc.habitId.title,
          category: doc.habitId.category,
          color: doc.habitId.color,
        }
      : undefined,
    viewerReaction: doc._viewerReaction ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toPlainComment(doc: any): IComment {
  const author = doc.userId as any;
  return {
    id: doc._id.toString(),
    userId: typeof author === "object" ? author._id.toString() : author.toString(),
    postId: doc.postId.toString(),
    text: doc.text,
    author: typeof author === "object" && author.name
      ? {
          id: author._id.toString(),
          name: author.name,
          username: author.username,
          image: author.image,
        }
      : undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ─── CREATE POST ─────────────────────────────────────────────────────────────

export async function createPost(
  userId: string,
  data: {
    type: IPost["type"];
    content: string;
    habitId?: string;
    streakCount?: number;
    visibility?: IPost["visibility"];
    metadata?: Record<string, unknown>;
  }
): Promise<ActionResult<IPost>> {
  try {
    await connectDB();

    if (!data.content?.trim()) {
      return { error: "Post content cannot be empty." };
    }
    if (data.content.length > 1000) {
      return { error: "Post must be 1000 characters or fewer." };
    }

    // ── Streak validation ──────────────────────────────────────────────
    if (data.type === "streak") {
      if (!data.habitId) {
        return { error: "Select a habit to share your streak." };
      }
      const habit = await Habit.findOne({
        _id: data.habitId,
        userId,
        archived: false,
      }).lean();
      if (!habit) {
        return { error: "Habit not found." };
      }
      const logs = await HabitLog.find({ userId, habitId: data.habitId })
        .sort({ date: -1 })
        .limit(400)
        .lean();

      // Minimal plain objects for streak calculation
      const plainHabit: IHabit = {
        id: (habit as any)._id.toString(),
        userId: (habit as any).userId.toString(),
        title: (habit as any).title,
        description: (habit as any).description,
        category: (habit as any).category ?? "Other",
        color: (habit as any).color ?? "#6366f1",
        icon: (habit as any).icon ?? "target",
        targetType: (habit as any).targetType,
        targetValue: (habit as any).targetValue,
        frequencyType: (habit as any).frequencyType,
        frequencyDays: (habit as any).frequencyDays,
        reminderTime: (habit as any).reminderTime,
        archived: false,
        visibility: (habit as any).visibility ?? "private",
        adoptionCount: (habit as any).adoptionCount ?? 0,
        createdAt: (habit as any).createdAt,
        updatedAt: (habit as any).updatedAt,
      };
      const plainLogs: IHabitLog[] = logs.map((l: any) => ({
        id: l._id.toString(),
        userId: l.userId.toString(),
        habitId: l.habitId.toString(),
        date: l.date,
        completed: l.completed,
        value: l.value,
        note: l.note,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      }));

      const actualStreak = calculateCurrentStreak(plainHabit, plainLogs);
      if (actualStreak < MIN_SHARE_STREAK) {
        return {
          error: `You need at least a ${MIN_SHARE_STREAK}-day streak to share. Your current streak is ${actualStreak} day${actualStreak === 1 ? "" : "s"}.`,
        };
      }
      // Prevent inflated streak count in the post
      if (data.streakCount && data.streakCount > actualStreak) {
        data = { ...data, streakCount: actualStreak };
      }
    }

    // ── Achievement validation ─────────────────────────────────────────
    if (data.type === "achievement") {
      const achievementId = data.metadata?.achievementId as string | undefined;
      if (!achievementId) {
        return { error: "Select an achievement to share." };
      }
      const stats = await computeAchievementStats(userId);
      if (!isAchievementUnlocked(achievementId, stats)) {
        return { error: "This achievement hasn't been unlocked yet." };
      }
    }

    const post = await Post.create({
      userId,
      type: data.type ?? "text",
      content: data.content.trim(),
      habitId: data.habitId ?? undefined,
      streakCount: data.streakCount ?? undefined,
      visibility: data.visibility ?? "followers",
      metadata: data.metadata ?? undefined,
    });

    revalidatePath("/social");
    revalidatePath("/dashboard");
    return { data: toPlainPost(post.toObject()) };
  } catch (err: any) {
    console.error("[createPost]", err);
    return { error: err.message || "Failed to create post." };
  }
}

// ─── DELETE POST ─────────────────────────────────────────────────────────────

export async function deletePost(
  userId: string,
  postId: string
): Promise<ActionResult> {
  try {
    await connectDB();
    const post = await Post.findOneAndDelete({ _id: postId, userId });
    if (!post) return { error: "Post not found or not yours." };

    // Clean up reactions and comments
    await Promise.all([
      Reaction.deleteMany({ postId }),
      Comment.deleteMany({ postId }),
    ]);

    revalidatePath("/social");
    revalidatePath("/dashboard");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── FEED: posts from followed users ─────────────────────────────────────────

export async function getFeedPosts(
  userId: string,
  page = 1,
  limit = 20
): Promise<ActionResult<{ posts: IPost[]; hasMore: boolean }>> {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    // Get IDs of everyone this user follows
    const follows = await Follow.find({ followerId: userId })
      .select("followingId")
      .lean();
    const followingIds = follows.map((f: any) => f.followingId);

    // Include the user's own posts in their feed
    const authorIds = [userId, ...followingIds];

    const [posts, total] = await Promise.all([
      Post.find({ userId: { $in: authorIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name username image")
        .populate("habitId", "title category color")
        .lean(),
      Post.countDocuments({ userId: { $in: authorIds } }),
    ]);

    // Attach viewer's reaction to each post
    const postIds = posts.map((p: any) => p._id);
    const viewerReactions = await Reaction.find({
      userId,
      postId: { $in: postIds },
    })
      .select("postId type")
      .lean();

    const reactionMap = new Map(
      viewerReactions.map((r: any) => [r.postId.toString(), r.type])
    );

    const enriched = posts.map((p: any) => ({
      ...p,
      _viewerReaction: reactionMap.get(p._id.toString()),
    }));

    return {
      data: {
        posts: enriched.map((p) => toPlainPost(p, userId)),
        hasMore: skip + posts.length < total,
      },
    };
  } catch (err: any) {
    console.error("[getFeedPosts]", err);
    return { error: "Failed to load feed." };
  }
}

// ─── USER PROFILE POSTS ───────────────────────────────────────────────────────

export async function getUserPosts(
  profileUserId: string,
  viewerUserId: string,
  page = 1,
  limit = 10
): Promise<ActionResult<{ posts: IPost[]; hasMore: boolean }>> {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    const isOwner = profileUserId === viewerUserId;

    // Visibility filter
    let visibilityFilter: object;
    if (isOwner) {
      visibilityFilter = {}; // owner sees all their posts
    } else {
      // Check if viewer follows this user
      const follows = await Follow.exists({
        followerId: viewerUserId,
        followingId: profileUserId,
      });
      visibilityFilter = follows
        ? {} // follower sees all
        : { visibility: "public" }; // stranger sees only public
    }

    const [posts, total] = await Promise.all([
      Post.find({ userId: profileUserId, ...visibilityFilter })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name username image")
        .populate("habitId", "title category color")
        .lean(),
      Post.countDocuments({ userId: profileUserId, ...visibilityFilter }),
    ]);

    // Attach viewer reactions
    const postIds = posts.map((p: any) => p._id);
    const viewerReactions = await Reaction.find({
      userId: viewerUserId,
      postId: { $in: postIds },
    })
      .select("postId type")
      .lean();
    const reactionMap = new Map(
      viewerReactions.map((r: any) => [r.postId.toString(), r.type])
    );

    const enriched = posts.map((p: any) => ({
      ...p,
      _viewerReaction: reactionMap.get(p._id.toString()),
    }));

    return {
      data: {
        posts: enriched.map((p) => toPlainPost(p, viewerUserId)),
        hasMore: skip + posts.length < total,
      },
    };
  } catch (err: any) {
    return { error: "Failed to load posts." };
  }
}

// ─── REACTIONS ────────────────────────────────────────────────────────────────

const REACTION_FIELD: Record<string, string> = {
  like: "likesCount",
  fire: "fireCount",
  clap: "clapCount",
};

/**
 * Toggle a reaction. If the user already reacted with the same type → remove it.
 * If they reacted with a different type → swap it.
 * Returns the new reaction type or null (removed).
 */
export async function toggleReaction(
  userId: string,
  postId: string,
  type: IReaction["type"]
): Promise<ActionResult<{ reactionType: IReaction["type"] | null }>> {
  try {
    await connectDB();

    const post = await Post.findById(postId);
    if (!post) return { error: "Post not found." };

    const existing = await Reaction.findOne({ userId, postId });

    if (existing) {
      if (existing.type === type) {
        // Remove reaction
        await existing.deleteOne();
        await Post.findByIdAndUpdate(postId, {
          $inc: { [REACTION_FIELD[type]]: -1 },
        });
        return { data: { reactionType: null } };
      } else {
        // Swap reaction
        const oldType = existing.type;
        existing.type = type;
        await existing.save();
        await Post.findByIdAndUpdate(postId, {
          $inc: {
            [REACTION_FIELD[oldType]]: -1,
            [REACTION_FIELD[type]]: 1,
          },
        });
        return { data: { reactionType: type } };
      }
    } else {
      // New reaction
      await Reaction.create({ userId, postId, type });
      await Post.findByIdAndUpdate(postId, {
        $inc: { [REACTION_FIELD[type]]: 1 },
      });

      // Notify post owner (if not reacting to own post)
      if (post.userId.toString() !== userId) {
        await Notification.create({
          userId: post.userId,
          type: "post_liked",
          title: "Someone reacted to your post",
          message: `Your post got a ${type === "like" ? "👍 like" : type === "fire" ? "🔥 fire" : "👏 clap"}!`,
          relatedUserId: userId,
          relatedPostId: postId,
        });
      }

      return { data: { reactionType: type } };
    }
  } catch (err: any) {
    console.error("[toggleReaction]", err);
    return { error: "Failed to update reaction." };
  }
}

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

export async function getPostComments(
  postId: string
): Promise<ActionResult<IComment[]>> {
  try {
    await connectDB();
    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 })
      .populate("userId", "name username image")
      .lean();

    return { data: comments.map(toPlainComment) };
  } catch (err: any) {
    return { error: "Failed to load comments." };
  }
}

export async function addComment(
  userId: string,
  postId: string,
  text: string
): Promise<ActionResult<IComment>> {
  try {
    if (!text?.trim()) return { error: "Comment cannot be empty." };
    if (text.length > 500) return { error: "Comment must be 500 characters or fewer." };

    await connectDB();

    const post = await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });
    if (!post) return { error: "Post not found." };

    const comment = await Comment.create({
      userId,
      postId,
      text: text.trim(),
    });

    // Populate author info
    const populated = await Comment.findById(comment._id)
      .populate("userId", "name username image")
      .lean();

    // Notify post owner
    if (post.userId.toString() !== userId) {
      await Notification.create({
        userId: post.userId,
        type: "post_commented",
        title: "New comment on your post",
        message: `Someone commented on your post.`,
        relatedUserId: userId,
        relatedPostId: postId,
      });
    }

    revalidatePath("/social");
    return { data: toPlainComment(populated) };
  } catch (err: any) {
    console.error("[addComment]", err);
    return { error: "Failed to add comment." };
  }
}

export async function deleteComment(
  userId: string,
  commentId: string
): Promise<ActionResult> {
  try {
    await connectDB();
    const comment = await Comment.findOneAndDelete({ _id: commentId, userId });
    if (!comment) return { error: "Comment not found or not yours." };

    await Post.findByIdAndUpdate(comment.postId, {
      $inc: { commentsCount: -1 },
    });

    revalidatePath("/social");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── ADOPT PUBLIC HABIT ───────────────────────────────────────────────────────

export async function adoptHabit(
  userId: string,
  sourceHabitId: string
): Promise<ActionResult<{ habitId: string }>> {
  try {
    await connectDB();

    const source = await Habit.findOne({
      _id: sourceHabitId,
      visibility: "public",
      archived: false,
    }).lean();

    if (!source) return { error: "Public habit not found." };
    if ((source as any).userId.toString() === userId) {
      return { error: "You cannot adopt your own habit." };
    }

    const newHabit = await Habit.create({
      userId,
      title: (source as any).title,
      description: (source as any).description,
      category: (source as any).category,
      color: (source as any).color,
      icon: (source as any).icon,
      targetType: (source as any).targetType,
      targetValue: (source as any).targetValue,
      frequencyType: (source as any).frequencyType,
      frequencyDays: (source as any).frequencyDays,
      visibility: "private", // adopter's copy is private by default
      copiedFromHabitId: source._id,
      copiedFromUserId: (source as any).userId,
    });

    // Increment adoption count on source
    await Habit.findByIdAndUpdate(sourceHabitId, {
      $inc: { adoptionCount: 1 },
    });

    // Notify original creator
    await Notification.create({
      userId: (source as any).userId,
      type: "habit_adopted",
      title: "Your habit was adopted!",
      message: `Someone added "${(source as any).title}" to their habits.`,
      relatedUserId: userId,
      relatedHabitId: sourceHabitId,
    });

    revalidatePath("/habits");
    revalidatePath("/explore");
    return { data: { habitId: newHabit._id.toString() } };
  } catch (err: any) {
    console.error("[adoptHabit]", err);
    return { error: "Failed to adopt habit." };
  }
}
