"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { HabitLogButton } from "@/components/habits/HabitLogButton";
import type { HabitWithStats } from "@/types";

interface TodayHabitsProps {
  habits: HabitWithStats[];
  userId: string;
}

export function TodayHabits({ habits, userId }: TodayHabitsProps) {
  const router = useRouter();

  const completedCount = habits.filter((h) => h.isCompletedToday).length;
  const progressPct =
    habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
  const allDone = habits.length > 0 && completedCount === habits.length;

  if (habits.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-semibold mb-1">No habits due today</p>
          <p className="text-sm text-muted-foreground mb-5">
            Create your first habit to start tracking your progress.
          </p>
          <Button asChild size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 border-0">
            <Link href="/habits/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create habit
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base">Today&apos;s Habits</CardTitle>
          <Badge
            variant={allDone ? "default" : "secondary"}
            className={allDone ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0" : ""}
          >
            {completedCount}/{habits.length}
          </Badge>
        </div>
        <div className="space-y-1">
          <Progress value={progressPct} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{progressPct}% complete</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {allDone && (
          <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3 mb-3">
            <PartyPopper className="h-4 w-4 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Amazing! All habits done for today! 🎉
            </p>
          </div>
        )}
        {habits.map((habit) => (
          <div
            key={habit.id}
            className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
              habit.isCompletedToday
                ? "bg-muted/30 border-border/50"
                : "hover:shadow-sm hover:border-violet-200 dark:hover:border-violet-800"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-8 w-8 rounded-xl shrink-0 flex items-center justify-center"
                style={{ backgroundColor: habit.color + "25" }}
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: habit.color }} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${habit.isCompletedToday ? "line-through text-muted-foreground" : ""}`}>
                  {habit.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {habit.currentStreak > 0 && (
                    <span className="text-xs text-orange-500 font-medium">🔥 {habit.currentStreak}d</span>
                  )}
                  <span className="text-xs text-muted-foreground capitalize">{habit.category}</span>
                </div>
              </div>
            </div>
            <HabitLogButton habit={habit} userId={userId} onSuccess={() => router.refresh()} />
          </div>
        ))}
        <div className="pt-1">
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground" asChild>
            <Link href="/habits">
              View all habits <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TodayHabitsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="h-5 w-10 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border p-3 animate-pulse">
            <div className="h-8 w-8 rounded-xl bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-muted shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
