import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  TrendingUp,
  ArrowRight,
  Plus,
  Users,
  Bell,
  Sparkles,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/actions/dashboard";
import { getNotifications } from "@/actions/notifications";
import { getFeedPosts } from "@/actions/posts";
import { getSuggestedUsers, getPublicHabits } from "@/actions/social";
import { getTodayString } from "@/lib/utils";
import { TodayHabits } from "@/components/dashboard/TodayHabits";
import { FeedPreview } from "@/components/social/FeedPreview";
import { UserCard } from "@/components/social/UserCard";
import { PublicHabitCard } from "@/components/explore/PublicHabitCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Home · HabitFlow" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const [dashboardData, notifications, feedResult, suggestedUsersResult, publicHabitsResult] =
    await Promise.all([
      getDashboardData(userId),
      getNotifications(userId, 3),
      getFeedPosts(userId, 1, 3),
      getSuggestedUsers(userId, 3),
      getPublicHabits(userId, 1, 4),
    ]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const completionPct =
    dashboardData.todayHabits.length > 0
      ? Math.round((dashboardData.completedToday / dashboardData.todayHabits.length) * 100)
      : 0;

  const feedPosts = feedResult.data?.posts ?? [];
  const suggestedUsers = suggestedUsersResult.data ?? [];
  const publicHabits = publicHabitsResult.data?.habits ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5 page-container">

      {/* ── Hero greeting ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 text-white shadow-lg shadow-blue-500/20">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-xs font-medium mb-0.5">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
            <h1 className="text-xl font-bold leading-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="mt-1 text-white/75 text-sm">
              {dashboardData.completedToday === 0 && dashboardData.todayHabits.length === 0
                ? "No habits scheduled today."
                : dashboardData.completedToday === dashboardData.todayHabits.length && dashboardData.todayHabits.length > 0
                ? "All habits done — amazing! 🎉"
                : `${dashboardData.completedToday} of ${dashboardData.todayHabits.length} habits done`}
            </p>
          </div>

          {/* Progress ring */}
          <div className="relative shrink-0 h-16 w-16">
            <svg viewBox="0 0 60 60" className="-rotate-90 h-16 w-16">
              <defs>
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.5)" />
                </linearGradient>
              </defs>
              <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
              <circle
                cx="30" cy="30" r="24"
                fill="none"
                stroke="url(#ring-grad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - completionPct / 100)}`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{completionPct}%</span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
          <StatPill icon="🔥" value={dashboardData.overallCurrentStreak} label="Streak" />
          <StatPill icon="🏆" value={dashboardData.overallLongestStreak} label="Best" />
          <StatPill icon="📈" value={dashboardData.overallCompletionRate} label="Rate" unit="%" />
        </div>
      </div>

      {/* ── Today's Habits (full-width blue section) ─────────────────── */}
      <TodayHabits habits={dashboardData.todayHabits} userId={userId} />

      {/* ── Social feed + sidebar ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Social feed */}
        <div className="lg:col-span-2 glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Latest from your network
            </h2>
            <Link href="/social">
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-blue-600 hover:bg-blue-100/60 dark:hover:bg-blue-950/30 rounded-xl">
                See all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <FeedPreview posts={feedPosts} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Notifications */}
          {notifications.length > 0 && (
            <section className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-500" />
                  Notifications
                  {unread > 0 && (
                    <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                      {unread}
                    </Badge>
                  )}
                </h2>
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground rounded-xl">
                    All <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-1.5">
                {notifications.slice(0, 3).map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-2xl px-3 py-2.5 text-xs border transition-colors ${
                      n.read
                        ? "bg-muted/40 border-border/40"
                        : "notif-card-unread dark:notif-card-unread"
                    }`}
                  >
                    <p className="font-semibold leading-tight">{n.title}</p>
                    <p className="text-muted-foreground mt-0.5 line-clamp-1">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Suggested users */}
          {suggestedUsers.length > 0 && (
            <section className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  Suggested people
                </h2>
                <Link href="/explore">
                  <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground rounded-xl">
                    More <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {suggestedUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    currentUserId={userId}
                    initialIsFollowing={false}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Trending habits */}
          {publicHabits.length > 0 && (
            <section className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Trending habits
                </h2>
                <Link href="/explore?tab=habits">
                  <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground rounded-xl">
                    Browse <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {publicHabits.slice(0, 3).map((habit) => (
                  <PublicHabitCard
                    key={habit.id}
                    habit={habit}
                    currentUserId={userId}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Quick add habit CTA */}
          <Link
            href="/habits/new"
            className="flex items-center gap-3 glass-panel px-4 py-3.5 hover:shadow-md transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">New habit</p>
              <p className="text-xs text-muted-foreground">
                Start tracking something new
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
  unit = "",
}: {
  icon: string;
  value: number;
  label: string;
  unit?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-2xl bg-white/15 py-2 px-1 backdrop-blur-sm">
      <span className="text-base">{icon}</span>
      <span className="text-base font-bold text-white leading-tight">
        {value}{unit}
      </span>
      <span className="text-[10px] text-white/70 font-medium">{label}</span>
    </div>
  );
}
