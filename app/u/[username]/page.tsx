import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { Users, Globe, Lock, ArrowLeft, Target } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getPublicProfile } from "@/actions/social";
import { getUserPosts } from "@/actions/posts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/social/FollowButton";
import { ProfileTabsClient } from "@/components/social/ProfileTabsClient";
import { getInitials } from "@/lib/utils";

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props) {
  return { title: `@${params.username} · HabitFlow` };
}

export default async function UserProfilePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const viewerUserId = (session?.user as { id?: string })?.id ?? "";

  const profileResult = await getPublicProfile(
    params.username,
    viewerUserId || undefined
  );

  if (profileResult.error === "User not found.") notFound();

  if (profileResult.error) {
    return (
      <PrivateProfileView
        username={params.username}
        hasSession={!!session}
      />
    );
  }

  const { user, habits, stats, isFollowing } = profileResult.data!;
  const isOwner = viewerUserId === user.id;

  // Fetch initial posts (server-side for SSR, client handles load-more)
  const postsResult = await getUserPosts(user.id, viewerUserId || "", 1, 10);
  const initialPosts = postsResult.data?.posts ?? [];
  const initialHasMore = postsResult.data?.hasMore ?? false;

  const publicHabits = habits.filter((h) => h.visibility === "public");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-violet-950/10 dark:to-indigo-950/10">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {session ? "Home" : "HabitFlow"}
          </Link>
          {!session && (
            <Link
              href="/login"
              className="ml-auto text-sm font-medium text-violet-600 hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
        {/* ── Profile hero card ─────────────────────────────────────── */}
        <div className="rounded-3xl bg-card border border-border/60 shadow-sm overflow-hidden">
          {/* Gradient banner */}
          <div className="h-28 profile-banner" />

          <div className="px-5 pb-5">
            {/* Avatar + action row */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                <AvatarImage src={user.image ?? ""} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-2xl font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-2 pb-1">
                {!user.isPublic && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                )}
                {isOwner ? (
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                  >
                    Edit profile
                  </Link>
                ) : session ? (
                  <FollowButton
                    targetUserId={user.id}
                    initialIsFollowing={isFollowing}
                  />
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Follow
                  </Link>
                )}
              </div>
            </div>

            {/* Name, username, bio */}
            <div className="space-y-0.5">
              <h1 className="text-xl font-bold leading-tight">{user.name}</h1>
              {user.username && (
                <p className="text-sm text-muted-foreground">
                  @{user.username}
                </p>
              )}
              {user.bio && (
                <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
                  {user.bio}
                </p>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <StatPill
                icon={<Users className="h-4 w-4 text-violet-500" />}
                value={stats.followersCount}
                label="Followers"
              />
              <StatPill
                icon={<Globe className="h-4 w-4 text-indigo-500" />}
                value={stats.followingCount}
                label="Following"
              />
              <StatPill
                icon={<Target className="h-4 w-4 text-emerald-500" />}
                value={stats.publicHabits}
                label="Habits"
              />
            </div>
          </div>
        </div>

        {/* ── Posts + Habits tabs ────────────────────────────────────── */}
        <ProfileTabsClient
          profileUserId={user.id}
          viewerUserId={viewerUserId}
          viewerName={session?.user?.name ?? ""}
          viewerImage={session?.user?.image ?? undefined}
          isOwner={isOwner}
          publicHabits={publicHabits}
          initialPosts={initialPosts}
          initialHasMore={initialHasMore}
        />
      </div>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-muted/60 py-3 px-2">
      {icon}
      <span className="text-base font-bold">{value?.toLocaleString()}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function PrivateProfileView({
  username,
  hasSession,
}: {
  username: string;
  hasSession: boolean;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-violet-950/10 dark:to-indigo-950/10 flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-xs">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted shadow-sm">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold">Private Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            @{username} has a private account. Follow them to see their habits
            and updates.
          </p>
        </div>
        <Link
          href={hasSession ? "/dashboard" : "/"}
          className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {hasSession ? "Back to Home" : "Back to HabitFlow"}
        </Link>
      </div>
    </div>
  );
}
