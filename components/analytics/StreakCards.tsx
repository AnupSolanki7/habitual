import { Flame, Trophy, TrendingUp, Target, Star, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSummary } from "@/types";

interface StreakCardsProps {
  summary: AnalyticsSummary;
}

export function StreakCards({ summary }: StreakCardsProps) {
  const cards = [
    {
      title: "Current Streak",
      value: `${summary.currentStreak} days`,
      icon: Flame,
      color: "text-orange-500",
    },
    {
      title: "Longest Streak",
      value: `${summary.longestStreak} days`,
      icon: Trophy,
      color: "text-yellow-500",
    },
    {
      title: "Completion Rate",
      value: `${summary.overallCompletionRate}%`,
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      title: "Habits Tracked",
      value: summary.totalHabitsTracked.toString(),
      icon: Target,
      color: "text-purple-500",
    },
    {
      title: "Total Completions",
      value: summary.totalCompletions.toString(),
      icon: Star,
      color: "text-green-500",
    },
    {
      title: "Best Day",
      value: summary.bestDayOfWeek,
      icon: Calendar,
      color: "text-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(({ title, value, icon: Icon, color }) => (
        <Card key={title}>
          <CardContent className="p-4 text-center">
            <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{title}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
