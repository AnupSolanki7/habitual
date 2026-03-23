import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentActivity } from "@/types";

interface RecentActivityListProps {
  activities: RecentActivity[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No activity yet. Start completing habits!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors">
            <div
              className="h-8 w-8 rounded-xl shrink-0 flex items-center justify-center"
              style={{ backgroundColor: activity.habitColor + "25" }}
            >
              <CheckCircle2 className="h-4 w-4" style={{ color: activity.habitColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.habitTitle}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
              </p>
            </div>
            <div
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: activity.habitColor + "15",
                color: activity.habitColor,
              }}
            >
              Done
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-5 w-32 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-2.5 animate-pulse">
            <div className="h-8 w-8 rounded-xl bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
            </div>
            <div className="h-5 w-10 rounded-full bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
