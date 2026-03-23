import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { HabitBreakdownItem } from "@/types";

interface HabitBreakdownProps {
  breakdown: HabitBreakdownItem[];
}

export function HabitBreakdown({ breakdown }: HabitBreakdownProps) {
  if (breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Habit Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No habit data yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit Breakdown (30 days)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {breakdown.map((item) => (
          <div key={item.habitId} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.currentStreak > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    🔥 {item.currentStreak}d
                  </Badge>
                )}
                <span className="text-sm font-medium">{item.completionRate}%</span>
              </div>
            </div>
            <Progress value={item.completionRate} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
