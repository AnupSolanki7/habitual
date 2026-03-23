import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/actions/dashboard";
import { getJournalEntry } from "@/actions/journal";
import { getTodayString, formatDate } from "@/lib/utils";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TodayHabits } from "@/components/dashboard/TodayHabits";
import { RecentActivityList } from "@/components/dashboard/RecentActivity";
import { JournalForm } from "@/components/journal/JournalForm";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const today = getTodayString();

  const [dashboardData, journalEntry] = await Promise.all([
    getDashboardData(userId),
    getJournalEntry(userId, today),
  ]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">
            {greeting}, {session.user.name?.split(" ")[0]} 👋
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Stats */}
      <StatsCards
        currentStreak={dashboardData.overallCurrentStreak}
        longestStreak={dashboardData.overallLongestStreak}
        completionRate={dashboardData.overallCompletionRate}
        completedToday={dashboardData.completedToday}
        totalToday={dashboardData.todayHabits.length}
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodayHabits habits={dashboardData.todayHabits} userId={userId} />
          <RecentActivityList activities={dashboardData.recentActivity} />
        </div>
        <div>
          <JournalForm userId={userId} date={today} existingEntry={journalEntry} />
        </div>
      </div>
    </div>
  );
}
