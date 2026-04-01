"use server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Follow from "@/models/Follow";
import Habit from "@/models/Habit";
import Notification from "@/models/Notification";
import { ActionResult, IUserPublic, IProfileStats, IHabit } from "@/types";

// ---------------------------------------------------------------------------
// FOLLOW / UNFOLLOW
// ---------------------------------------------------------------------------

/**
 * Follow a user.
 * Business rules:
 *  - A user cannot follow themselves
 *  - A user cannot follow the same person twice
 *  - Creates a new_follower notification for the followee
 */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<ActionResult> {
  if (followerId === followingId) {
    return { error: "You cannot follow yourself." };
  }

  try {
    await connectDB();

    // Verify both users exist
    const [follower, following] = await Promise.all([
      User.findById(followerId).select("_id name username image").lean(),
      User.findById(followingId).select("_id").lean(),
    ]);

    if (!follower || !following) {
      return { error: "User not found." };
    }

    // Create the follow relationship (unique index will reject duplicates)
    try {
      await Follow.create({ followerId, followingId });
    } catch (err: unknown) {
      // Duplicate key error — already following
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: number }).code === 11000
      ) {
        return { error: "You are already following this user." };
      }
      throw err;
    }

    // Increment counters atomically
    await Promise.all([
      User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } }),
      User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } }),
    ]);

    // Notify the followee
    const followerDoc = follower as {
      name: string;
      username?: string;
      image?: string;
    };
    await Notification.create({
      userId: followingId,
      type: "new_follower",
      title: "New follower",
      message: `${followerDoc.name} started following you.`,
      relatedUserId: followerId,
    });

    return {};
  } catch (err) {
    console.error("[followUser]", err);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Unfollow a user.
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<ActionResult> {
  if (followerId === followingId) {
    return { error: "Invalid operation." };
  }

  try {
    await connectDB();

    const result = await Follow.findOneAndDelete({ followerId, followingId });
    if (!result) {
      return { error: "You are not following this user." };
    }

    // Decrement counters, floor at 0
    await Promise.all([
      User.findByIdAndUpdate(followerId, {
        $inc: { followingCount: -1 },
      }),
      User.findByIdAndUpdate(followingId, {
        $inc: { followersCount: -1 },
      }),
    ]);

    return {};
  } catch (err) {
    console.error("[unfollowUser]", err);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Check whether followerI is following followingId.
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  if (!followerId || !followingId || followerId === followingId) return false;
  try {
    await connectDB();
    const exists = await Follow.exists({ followerId, followingId });
    return !!exists;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// PUBLIC PROFILE
// ---------------------------------------------------------------------------

/**
 * Get a user's public profile by username.
 * Returns null if the user doesn't exist or has a private profile
 * (private profiles are only visible to the owner and their followers).
 */
export async function getPublicProfile(
  username: string,
  viewerUserId?: string
): Promise<ActionResult<{ user: IUserPublic; habits: IHabit[]; stats: IProfileStats; isFollowing: boolean }>> {
  try {
    await connectDB();

    const user = await User.findOne({ username: username.toLowerCase() })
      .select("_id name username image bio isPublic followersCount followingCount")
      .lean();

    if (!user) {
      return { error: "User not found." };
    }

    const userId = (user as { _id: { toString(): string } })._id.toString();
    const isOwner = viewerUserId === userId;

    // Private profiles: only visible to owner
    if (!(user as { isPublic: boolean }).isPublic && !isOwner) {
      return { error: "This profile is private." };
    }

    // Check if viewer is already following this profile
    let viewerIsFollowing = false;
    if (viewerUserId && !isOwner) {
      viewerIsFollowing = await isFollowing(viewerUserId, userId);
    }

    // Public habits only (unless the viewer is the owner)
    const habitFilter = isOwner
      ? { userId, archived: false }
      : { userId, archived: false, visibility: "public" };

    const habits = await Habit.find(habitFilter)
      .sort({ createdAt: -1 })
      .lean();

    const userDoc = user as {
      _id: { toString(): string };
      name: string;
      username?: string;
      image?: string;
      bio?: string;
      isPublic: boolean;
      followersCount: number;
      followingCount: number;
    };

    const userPublic: IUserPublic = {
      id: userId,
      name: userDoc.name,
      username: userDoc.username,
      image: userDoc.image,
      bio: userDoc.bio,
      isPublic: userDoc.isPublic,
      followersCount: userDoc.followersCount,
      followingCount: userDoc.followingCount,
    };

    const stats: IProfileStats = {
      totalHabits: habits.length,
      publicHabits: habits.filter((h: { visibility?: string }) => h.visibility === "public").length,
      currentStreak: 0, // populated in Phase 2 with habit log data
      longestStreak: 0,
      followersCount: userDoc.followersCount,
      followingCount: userDoc.followingCount,
    };

    const serializedHabits: IHabit[] = habits.map((h: {
      _id: { toString(): string };
      userId: { toString(): string };
      title: string;
      description?: string;
      category: string;
      color: string;
      icon: string;
      targetType: "boolean" | "count" | "duration";
      targetValue: number;
      frequencyType: "daily" | "weekly" | "custom";
      frequencyDays?: number[];
      reminderTime?: string;
      archived: boolean;
      visibility?: "private" | "public";
      adoptionCount?: number;
      copiedFromHabitId?: { toString(): string };
      copiedFromUserId?: { toString(): string };
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: h._id.toString(),
      userId: h.userId.toString(),
      title: h.title,
      description: h.description,
      category: h.category,
      color: h.color,
      icon: h.icon,
      targetType: h.targetType,
      targetValue: h.targetValue,
      frequencyType: h.frequencyType,
      frequencyDays: h.frequencyDays,
      reminderTime: h.reminderTime,
      archived: h.archived,
      visibility: h.visibility ?? "private",
      adoptionCount: h.adoptionCount ?? 0,
      copiedFromHabitId: h.copiedFromHabitId?.toString(),
      copiedFromUserId: h.copiedFromUserId?.toString(),
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
    }));

    return {
      data: {
        user: userPublic,
        habits: serializedHabits,
        stats,
        isFollowing: viewerIsFollowing,
      },
    };
  } catch (err) {
    console.error("[getPublicProfile]", err);
    return { error: "Something went wrong." };
  }
}

// ---------------------------------------------------------------------------
// FOLLOWERS / FOLLOWING LISTS
// ---------------------------------------------------------------------------

export async function getFollowers(
  userId: string,
  page = 1,
  limit = 20
): Promise<ActionResult<{ users: IUserPublic[]; total: number }>> {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      Follow.find({ followingId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate<{ followerId: { _id: { toString(): string }; name: string; username?: string; image?: string; bio?: string; isPublic: boolean; followersCount: number; followingCount: number } }>(
          "followerId",
          "name username image bio isPublic followersCount followingCount"
        )
        .lean(),
      Follow.countDocuments({ followingId: userId }),
    ]);

    const users: IUserPublic[] = follows
      .map((f) => {
        const u = f.followerId;
        if (!u) return null;
        return {
          id: u._id.toString(),
          name: u.name,
          username: u.username,
          image: u.image,
          bio: u.bio,
          isPublic: u.isPublic,
          followersCount: u.followersCount,
          followingCount: u.followingCount,
        };
      })
      .filter((u): u is IUserPublic => u !== null);

    return { data: { users, total } };
  } catch (err) {
    console.error("[getFollowers]", err);
    return { error: "Something went wrong." };
  }
}

export async function getFollowing(
  userId: string,
  page = 1,
  limit = 20
): Promise<ActionResult<{ users: IUserPublic[]; total: number }>> {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      Follow.find({ followerId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate<{ followingId: { _id: { toString(): string }; name: string; username?: string; image?: string; bio?: string; isPublic: boolean; followersCount: number; followingCount: number } }>(
          "followingId",
          "name username image bio isPublic followersCount followingCount"
        )
        .lean(),
      Follow.countDocuments({ followerId: userId }),
    ]);

    const users: IUserPublic[] = follows
      .map((f) => {
        const u = f.followingId;
        if (!u) return null;
        return {
          id: u._id.toString(),
          name: u.name,
          username: u.username,
          image: u.image,
          bio: u.bio,
          isPublic: u.isPublic,
          followersCount: u.followersCount,
          followingCount: u.followingCount,
        };
      })
      .filter((u): u is IUserPublic => u !== null);

    return { data: { users, total } };
  } catch (err) {
    console.error("[getFollowing]", err);
    return { error: "Something went wrong." };
  }
}

// ---------------------------------------------------------------------------
// USER SEARCH
// ---------------------------------------------------------------------------

export async function searchUsers(
  query: string,
  viewerUserId?: string,
  limit = 10
): Promise<ActionResult<IUserPublic[]>> {
  if (!query || query.trim().length < 2) {
    return { data: [] };
  }

  try {
    await connectDB();

    const regex = new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const users = await User.find({
      isPublic: true,
      $or: [{ name: regex }, { username: regex }],
      // Exclude the viewer from search results
      ...(viewerUserId ? { _id: { $ne: viewerUserId } } : {}),
    })
      .select("name username image bio isPublic followersCount followingCount")
      .limit(limit)
      .lean();

    const result: IUserPublic[] = users.map((u: {
      _id: { toString(): string };
      name: string;
      username?: string;
      image?: string;
      bio?: string;
      isPublic: boolean;
      followersCount: number;
      followingCount: number;
    }) => ({
      id: u._id.toString(),
      name: u.name,
      username: u.username,
      image: u.image,
      bio: u.bio,
      isPublic: u.isPublic,
      followersCount: u.followersCount,
      followingCount: u.followingCount,
    }));

    return { data: result };
  } catch (err) {
    console.error("[searchUsers]", err);
    return { error: "Search failed." };
  }
}

// ---------------------------------------------------------------------------
// USERNAME AVAILABILITY CHECK
// ---------------------------------------------------------------------------

export async function checkUsernameAvailable(
  username: string,
  currentUserId?: string
): Promise<ActionResult<{ available: boolean }>> {
  const cleaned = username.toLowerCase().trim();
  if (!/^[a-z0-9_]{3,30}$/.test(cleaned)) {
    return {
      data: { available: false },
      error: "Username must be 3–30 characters: letters, numbers, underscores only.",
    };
  }

  try {
    await connectDB();
    const query: Record<string, unknown> = { username: cleaned };
    if (currentUserId) {
      query._id = { $ne: currentUserId };
    }
    const exists = await User.exists(query);
    return { data: { available: !exists } };
  } catch (err) {
    console.error("[checkUsernameAvailable]", err);
    return { error: "Check failed." };
  }
}

// ---------------------------------------------------------------------------
// PUBLIC HABIT DISCOVERY
// ---------------------------------------------------------------------------

export async function getPublicHabits(
  viewerUserId?: string,
  page = 1,
  limit = 20,
  category?: string,
  sort: "newest" | "popular" = "newest"
): Promise<ActionResult<{ habits: (IHabit & { creator: IUserPublic })[]; total: number }>> {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      visibility: "public",
      archived: false,
    };
    if (category) filter.category = category;

    const sortOrder = sort === "popular"
      ? { adoptionCount: -1, createdAt: -1 }
      : { createdAt: -1 };

    const [habits, total] = await Promise.all([
      Habit.find(filter)
        .sort(sortOrder as any)
        .skip(skip)
        .limit(limit)
        .populate("userId", "name username image bio isPublic followersCount followingCount")
        .lean(),
      Habit.countDocuments(filter),
    ]);

    const result = habits.map((h: any) => {
      const creator = h.userId as any;
      return {
        id: h._id.toString(),
        userId: creator._id.toString(),
        title: h.title,
        description: h.description,
        category: h.category,
        color: h.color,
        icon: h.icon,
        targetType: h.targetType,
        targetValue: h.targetValue,
        frequencyType: h.frequencyType,
        frequencyDays: h.frequencyDays,
        reminderTime: h.reminderTime,
        archived: h.archived,
        visibility: h.visibility,
        adoptionCount: h.adoptionCount ?? 0,
        copiedFromHabitId: h.copiedFromHabitId?.toString(),
        copiedFromUserId: h.copiedFromUserId?.toString(),
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
        creator: {
          id: creator._id.toString(),
          name: creator.name,
          username: creator.username,
          image: creator.image,
          bio: creator.bio,
          isPublic: creator.isPublic,
          followersCount: creator.followersCount ?? 0,
          followingCount: creator.followingCount ?? 0,
        },
      };
    });

    return { data: { habits: result as any, total } };
  } catch (err) {
    console.error("[getPublicHabits]", err);
    return { error: "Failed to load public habits." };
  }
}

// ---------------------------------------------------------------------------
// SUGGESTED USERS (for discovery / dashboard)
// ---------------------------------------------------------------------------

export async function getSuggestedUsers(
  viewerUserId: string,
  limit = 6
): Promise<ActionResult<IUserPublic[]>> {
  try {
    await connectDB();

    // Get IDs the viewer already follows
    const follows = await Follow.find({ followerId: viewerUserId })
      .select("followingId")
      .lean();
    const alreadyFollowing = follows.map((f: any) => f.followingId.toString());
    const excludeIds = [viewerUserId, ...alreadyFollowing];

    const users = await User.find({
      _id: { $nin: excludeIds },
      isPublic: true,
    })
      .sort({ followersCount: -1 })
      .limit(limit)
      .select("name username image bio isPublic followersCount followingCount")
      .lean();

    const result: IUserPublic[] = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      username: u.username,
      image: u.image,
      bio: u.bio,
      isPublic: u.isPublic,
      followersCount: u.followersCount ?? 0,
      followingCount: u.followingCount ?? 0,
    }));

    return { data: result };
  } catch (err) {
    console.error("[getSuggestedUsers]", err);
    return { error: "Failed to load suggestions." };
  }
}

// ---------------------------------------------------------------------------
// ALL PUBLIC USERS (for Explore)
// ---------------------------------------------------------------------------

export async function getAllPublicUsers(
  viewerUserId: string,
  page = 1,
  limit = 20
): Promise<ActionResult<{ users: (IUserPublic & { isFollowing: boolean })[]; total: number }>> {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ isPublic: true, _id: { $ne: viewerUserId } })
        .sort({ followersCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("name username image bio isPublic followersCount followingCount")
        .lean(),
      User.countDocuments({ isPublic: true, _id: { $ne: viewerUserId } }),
    ]);

    // Check which ones viewer follows
    const userIds = users.map((u: any) => u._id);
    const follows = await Follow.find({
      followerId: viewerUserId,
      followingId: { $in: userIds },
    })
      .select("followingId")
      .lean();
    const followingSet = new Set(follows.map((f: any) => f.followingId.toString()));

    const result = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      username: u.username,
      image: u.image,
      bio: u.bio,
      isPublic: u.isPublic,
      followersCount: u.followersCount ?? 0,
      followingCount: u.followingCount ?? 0,
      isFollowing: followingSet.has(u._id.toString()),
    }));

    return { data: { users: result, total } };
  } catch (err) {
    console.error("[getAllPublicUsers]", err);
    return { error: "Failed to load users." };
  }
}
