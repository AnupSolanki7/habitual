import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAnalyticsSummary } from "@/lib/analytics";
import { StreakCards } from "@/components/analytics/StreakCards";
import { CompletionChart } from "@/components/analytics/CompletionChart";
import { HabitBreakdown } from "@/components/analytics/HabitBreakdown";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const summary = await getAnalyticsSummary(userId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Insights from your habit tracking</p>
      </div>

      <StreakCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompletionChart weeklyData={summary.weeklyData} />
        <HabitBreakdown breakdown={summary.habitBreakdown} />
      </div>
    </div>
  );
}
