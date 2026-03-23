"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Edit2, Archive, Trash2, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveHabit, deleteHabit } from "@/actions/habits";
import { useToast } from "@/components/ui/use-toast";
import type { HabitWithStats } from "@/types";

interface HabitCardProps {
  habit: HabitWithStats;
  userId: string;
}

export function HabitCard({ habit, userId }: HabitCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      const res = await archiveHabit(userId, habit.id, true);
      if (res.error) {
        toast({ variant: "destructive", title: "Error", description: res.error });
      } else {
        toast({ title: "Habit archived" });
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${habit.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteHabit(userId, habit.id);
      if (res.error) {
        toast({ variant: "destructive", title: "Error", description: res.error });
      } else {
        toast({ title: "Habit deleted" });
        router.refresh();
      }
    });
  }

  return (
    <Card className={`group relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${
      habit.isCompletedToday ? "opacity-75" : ""
    }`}>
      {/* Color accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: habit.color }}
      />

      <CardContent className="pt-5 pb-4 px-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          {/* Icon + title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-10 w-10 rounded-2xl shrink-0 flex items-center justify-center text-lg"
              style={{ backgroundColor: habit.color + "20" }}
            >
              {habit.isCompletedToday ? (
                <CheckCircle2 className="h-5 w-5" style={{ color: habit.color }} />
              ) : (
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: habit.color }} />
              )}
            </div>
            <div className="min-w-0">
              <Link href={`/habits/${habit.id}`} className="group/link">
                <p className="font-semibold text-sm truncate group-hover/link:text-primary transition-colors">
                  {habit.title}
                </p>
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="secondary" className="text-xs h-4 px-1.5 font-normal">
                  {habit.category}
                </Badge>
                <span className="text-xs text-muted-foreground capitalize">{habit.frequencyType}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                disabled={isPending}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href={`/habits/${habit.id}`} className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5" /> View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/habits/${habit.id}/edit`} className="flex items-center gap-2">
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleArchive} className="gap-2">
                <Archive className="h-3.5 w-3.5" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="gap-2 text-destructive focus:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-sm font-bold">🔥 {habit.currentStreak}</p>
            <p className="text-xs text-muted-foreground">streak</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-sm font-bold">{habit.completionRate}%</p>
            <p className="text-xs text-muted-foreground">30-day</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <p className="text-sm font-bold">🏆 {habit.longestStreak}</p>
            <p className="text-xs text-muted-foreground">best</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={habit.completionRate} className="h-1.5" />
        </div>

        {/* Status chip */}
        {habit.isDueToday && (
          <div className="mt-2.5 flex justify-end">
            {habit.isCompletedToday ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Done today
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                ⏳ Pending
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HabitCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="h-0.5 w-full bg-muted" />
      <CardContent className="pt-5 pb-4 px-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-2xl bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
          <div className="h-7 w-7 rounded bg-muted shrink-0" />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted" />
      </CardContent>
    </Card>
  );
}
