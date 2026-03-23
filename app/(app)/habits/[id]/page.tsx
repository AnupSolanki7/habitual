import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Edit } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getHabitWithStats } from "@/actions/habits";
import { getLogsForHabit } from "@/actions/habitLogs";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HabitCalendar } from "@/components/habits/HabitCalendar";
import { Flame, Trophy, TrendingUp } from "lucide-react";

interface Props {
  params: { id: string };
}

export default async function HabitDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const habit = await getHabitWithStats(userId, params.id);
  if (!habit) notFound();

  const logs = await getLogsForHabit(userId, params.id, 90);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: habit.color }}
          >
            {habit.title.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{habit.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{habit.category}</Badge>
              <Badge variant="outline">
                {habit.targetType === "boolean" ? "Yes/No" : habit.targetType === "count" ? "Count" : "Duration"}
              </Badge>
              <Badge variant="outline">
                {habit.frequencyType === "daily" ? "Daily" : habit.frequencyType === "weekly" ? "Weekly" : "Custom"}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/habits/${habit.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
      </div>

      {habit.description && (
        <p className="text-muted-foreground">{habit.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{habit.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{habit.longestStreak}</p>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{habit.completionRate}%</p>
            <p className="text-xs text-muted-foreground">30d Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitCalendar logs={logs} />
        </CardContent>
      </Card>

      {/* Recent logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No logs yet.</p>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{format(new Date(log.date), "EEE, MMM d")}</p>
                    {log.note && <p className="text-xs text-muted-foreground">{log.note}</p>}
                  </div>
                  <Badge variant={log.completed ? "default" : "secondary"}>
                    {log.completed ? "Done" : "Missed"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
