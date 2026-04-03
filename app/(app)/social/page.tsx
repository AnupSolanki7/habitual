import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus, Users, UserCheck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getFeedPosts } from "@/actions/posts";
import { SocialFeedClient } from "./SocialFeedClient";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Social · Habi2ual" };

export default async function SocialPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string; name?: string; image?: string }).id;
  const userName = session.user.name ?? "You";
  const userImage = session.user.image ?? undefined;

  await connectDB();
  const currentUser = await User.findById(userId)
    .select("username followersCount followingCount")
    .lean();

  const u = currentUser as {
    username?: string;
    followersCount?: number;
    followingCount?: number;
  } | null;

  const feedResult = await getFeedPosts(userId, 1, 15);
  const initialPosts = feedResult.data?.posts ?? [];
  const hasMore = feedResult.data?.hasMore ?? false;

  const followers = u?.followersCount ?? 0;
  const following = u?.followingCount ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5 page-container">

      {/* ── Header card ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-violet-600 to-indigo-700 p-5 text-white shadow-lg shadow-violet-500/20">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-6 left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold leading-tight">Social</h1>
              <p className="text-white/70 text-sm mt-0.5">
                Updates from your network
              </p>
            </div>
            <Link href="/explore" className="shrink-0 mt-0.5">
              <Button
                size="sm"
                className="rounded-full gap-1.5 bg-white/20 hover:bg-white/30 border border-white/25 text-white text-xs backdrop-blur-sm h-8 px-3"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Find people</span>
                <span className="xs:hidden">Find</span>
              </Button>
            </Link>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-2.5 mt-4">
            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <UserCheck className="h-3.5 w-3.5 text-white/80" />
              <span className="text-sm font-bold leading-none">{followers.toLocaleString()}</span>
              <span className="text-xs text-white/65 leading-none">
                {followers === 1 ? "follower" : "followers"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <Users className="h-3.5 w-3.5 text-white/80" />
              <span className="text-sm font-bold leading-none">{following.toLocaleString()}</span>
              <span className="text-xs text-white/65 leading-none">following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Username setup prompt */}
      {!u?.username && (
        <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-200/60 dark:border-violet-800/40 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Set up your username</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose a @username so others can find and follow you.
              </p>
            </div>
            <Link href="/settings">
              <Button size="sm" variant="outline" className="rounded-xl text-xs h-8 shrink-0">
                Set up
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Feed with composer */}
      <SocialFeedClient
        currentUserId={userId}
        currentUserName={userName}
        currentUserImage={userImage}
        initialPosts={initialPosts}
        initialHasMore={hasMore}
      />
    </div>
  );
}
