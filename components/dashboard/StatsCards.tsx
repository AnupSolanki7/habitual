import { Flame, Trophy, TrendingUp, CheckCircle2 } from "lucide-react";

interface StatsCardsProps {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  completedToday: number;
  totalToday: number;
}

export function StatsCards({
  currentStreak,
  longestStreak,
  completionRate,
  completedToday,
  totalToday,
}: StatsCardsProps) {
  const items = [
    {
      label: "Current Streak",
      value: currentStreak,
      unit: "days",
      icon: Flame,
      bg: "from-orange-50 to-rose-50 dark:from-orange-950/25 dark:to-rose-950/25",
      border: "border-orange-100 dark:border-orange-900/30",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-500",
    },
    {
      label: "Longest Streak",
      value: longestStreak,
      unit: "days",
      icon: Trophy,
      bg: "from-yellow-50 to-amber-50 dark:from-yellow-950/25 dark:to-amber-950/25",
      border: "border-yellow-100 dark:border-yellow-900/30",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-500",
    },
    {
      label: "30-Day Rate",
      value: completionRate,
      unit: "%",
      icon: TrendingUp,
      bg: "from-blue-50 to-indigo-50 dark:from-blue-950/25 dark:to-indigo-950/25",
      border: "border-blue-100 dark:border-blue-900/30",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-500",
    },
    {
      label: "Done Today",
      value: completedToday,
      unit: `/ ${totalToday}`,
      icon: CheckCircle2,
      bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/25 dark:to-teal-950/25",
      border: "border-emerald-100 dark:border-emerald-900/30",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ label, value, unit, icon: Icon, bg, border, iconBg, iconColor }) => (
        <div
          key={label}
          className={`rounded-2xl border ${border} bg-gradient-to-br ${bg} p-4 transition-all hover:shadow-md hover:-translate-y-0.5`}
        >
          <div className={`inline-flex rounded-xl ${iconBg} p-2.5 mb-3`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-sm text-muted-foreground">{unit}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
        </div>
      ))}
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-muted/30 p-4 space-y-3 animate-pulse"
        >
          <div className="h-10 w-10 rounded-xl bg-muted" />
          <div className="h-7 w-14 rounded-lg bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
