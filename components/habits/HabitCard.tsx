"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Edit2,
  Archive,
  Trash2,
  ExternalLink,
  Flame,
  Trophy,
  Clock,
  Calendar,
  Check,
  Globe,
} from "lucide-react";
import { getCategoryIcon } from "@/constants/habitIcons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveHabit, deleteHabit } from "@/actions/habits";
import { logHabit } from "@/actions/habitLogs";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { HabitWithStats } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const FREQ_LABEL: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  custom: "Custom",
};

// ─── HabitCard ────────────────────────────────────────────────────────────────

interface HabitCardProps {
  habit: HabitWithStats;
  userId?: string;
  onArchive?: (id: string, archived: boolean) => void;
  onDelete?: (id: string) => void;
  onLog?: () => void;
}

export function HabitCard({
  habit,
  userId,
  onArchive,
  onDelete,
  onLog,
}: HabitCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [localCompleted, setLocalCompleted] = useState(habit.isCompletedToday);
  const [localValue] = useState(habit.todayLog?.value ?? 0);

  const isDone = localCompleted;
  const progress =
    habit.targetType === "boolean"
      ? isDone
        ? 100
        : 0
      : Math.min(
          100,
          Math.round((localValue / Math.max(1, habit.targetValue)) * 100)
        );

  // Only boolean habits that are due today get a quick-complete button
  const canQuickLog =
    !!userId && habit.isDueToday && habit.targetType === "boolean";

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleArchive() {
    if (onArchive) {
      onArchive(habit.id, !habit.archived);
      return;
    }
    if (!userId) return;
    startTransition(async () => {
      const res = await archiveHabit(userId, habit.id, true);
      if (res.error)
        toast({ variant: "destructive", title: "Error", description: res.error });
      else {
        toast({ title: "Habit archived" });
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${habit.title}"? This cannot be undone.`)) return;
    if (onDelete) {
      onDelete(habit.id);
      return;
    }
    if (!userId) return;
    startTransition(async () => {
      const res = await deleteHabit(userId, habit.id);
      if (res.error)
        toast({ variant: "destructive", title: "Error", description: res.error });
      else {
        toast({ title: "Habit deleted" });
        router.refresh();
      }
    });
  }

  function handleQuickLog() {
    if (!userId) return;
    const next = !isDone;
    setLocalCompleted(next);
    startTransition(async () => {
      const res = await logHabit(userId, habit.id, {
        completed: next,
        value: next ? 1 : 0,
      });
      if (res.error) {
        setLocalCompleted(!next);
        toast({ variant: "destructive", title: "Error", description: res.error });
      } else {
        onLog?.();
        router.refresh();
      }
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const CategoryIcon = getCategoryIcon(habit.category);

  return (
    <div
      className={cn(
        "habit-card group relative overflow-hidden",
        isDone && "habit-card-done"
      )}
    >
      {/* Left color accent strip */}
      <div
        className="absolute left-0 inset-y-0 w-[3px] rounded-l-3xl"
        style={{ backgroundColor: habit.color }}
      />

      {/* Ambient color glow (behind content) */}
      <div
        className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full blur-3xl opacity-[0.18] dark:opacity-[0.12]"
        style={{ backgroundColor: habit.color }}
      />

      <div className="relative pl-5 pr-4 pt-4 pb-3.5 space-y-3">

        {/* ── Row 1: Icon · Title · Tags · Menu ─────────────────────────── */}
        <div className="flex items-start gap-3">
          {/* Category icon badge */}
          <div
            className={cn(
              "h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200",
              isDone ? "opacity-50" : "group-hover:scale-105"
            )}
            style={{ backgroundColor: habit.color + "22" }}
          >
            {isDone ? (
              <Check
                className="h-5 w-5"
                style={{ color: habit.color }}
                strokeWidth={2.5}
              />
            ) : (
              <CategoryIcon className="h-5 w-5" style={{ color: habit.color }} />
            )}
          </div>

          {/* Title + meta chips */}
          <div className="flex-1 min-w-0 pt-0.5">
            <Link href={`/habits/${habit.id}`} className="block">
              <p
                className={cn(
                  "font-bold text-sm leading-snug truncate transition-colors hover:text-primary",
                  isDone && "line-through opacity-50"
                )}
              >
                {habit.title}
              </p>
            </Link>

            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {/* Category chip */}
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: habit.color + "18",
                  color: habit.color,
                }}
              >
                {habit.category}
              </span>

              {/* Streak chip */}
              {habit.currentStreak > 0 && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                  <Flame className="h-2.5 w-2.5" />
                  {habit.currentStreak}d
                </span>
              )}

              {/* Due chip */}
              {habit.isDueToday && !isDone && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  <Clock className="h-2.5 w-2.5" /> Due
                </span>
              )}

              {/* Done chip */}
              {isDone && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> Done
                </span>
              )}
            </div>
          </div>

          {/* Context menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-0.5 -mr-1 rounded-xl text-muted-foreground"
                disabled={isPending}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link
                  href={`/habits/${habit.id}`}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/habits/${habit.id}/edit`}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleArchive} className="gap-2">
                <Archive className="h-3.5 w-3.5" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Row 2: Progress bar (count / duration only) ────────────────── */}
        {habit.targetType !== "boolean" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {habit.targetType === "duration"
                  ? `${localValue} / ${habit.targetValue} min`
                  : `${localValue} / ${habit.targetValue}×`}
              </span>
              <span
                className="text-xs font-bold"
                style={{ color: habit.color }}
              >
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundColor: habit.color,
                }}
              />
            </div>
          </div>
        )}

        {/* ── Row 3: Stats · Quick-log button ────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Stat mini-pills */}
          <div className="flex gap-1.5 flex-1 min-w-0">
            <div className="flex flex-col items-center rounded-xl px-2.5 py-1.5 bg-muted/40 flex-1">
              <span className="inline-flex items-center gap-0.5 text-xs font-bold leading-none mb-0.5">
                <Flame className="h-3 w-3 text-orange-500" />
                {habit.currentStreak}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none">
                streak
              </span>
            </div>
            <div className="flex flex-col items-center rounded-xl px-2.5 py-1.5 bg-muted/40 flex-1">
              <span className="text-xs font-bold leading-none mb-0.5">
                {habit.completionRate}%
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none">
                30-day
              </span>
            </div>
            <div className="flex flex-col items-center rounded-xl px-2.5 py-1.5 bg-muted/40 flex-1">
              <span className="inline-flex items-center gap-0.5 text-xs font-bold leading-none mb-0.5">
                <Trophy className="h-3 w-3 text-yellow-500" />
                {habit.longestStreak}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none">
                best
              </span>
            </div>
          </div>

          {/* Quick-complete button (boolean + due today only) */}
          {canQuickLog && (
            <button
              onClick={handleQuickLog}
              disabled={isPending}
              aria-label={isDone ? "Mark as not done" : "Mark as done"}
              className={cn(
                "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-200",
                isPending && "opacity-60 cursor-not-allowed",
                isDone
                  ? "bg-gradient-to-br from-emerald-400 to-green-500 shadow-md shadow-emerald-500/30"
                  : "border-2 hover:scale-105 active:scale-95 hover:shadow-md"
              )}
              style={
                isDone
                  ? undefined
                  : {
                      borderColor: habit.color + "70",
                      backgroundColor: habit.color + "12",
                    }
              }
            >
              {isDone ? (
                <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
              ) : (
                <div
                  className="h-3.5 w-3.5 rounded-full border-2"
                  style={{ borderColor: habit.color + "90" }}
                />
              )}
            </button>
          )}
        </div>

        {/* ── Row 4: Footer metadata ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 pt-0.5 border-t border-border/30">
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/80">
            <Calendar className="h-3 w-3" />
            {FREQ_LABEL[habit.frequencyType] ?? habit.frequencyType}
          </span>

          {habit.reminderTime && (
            <>
              <span className="text-muted-foreground/30 select-none">·</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/80">
                <Clock className="h-3 w-3" />
                {habit.reminderTime}
              </span>
            </>
          )}

          {habit.visibility === "public" && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-violet-100/70 dark:bg-violet-950/30 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400">
              <Globe className="h-2.5 w-2.5" />
              Public
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function HabitCardSkeleton() {
  return (
    <div className="habit-card relative overflow-hidden animate-pulse">
      {/* Simulated left accent */}
      <div className="absolute left-0 inset-y-0 w-[3px] rounded-l-3xl bg-muted" />

      <div className="pl-5 pr-4 pt-4 pb-3.5 space-y-3">
        {/* Row 1 */}
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-muted shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 w-32 rounded-lg bg-muted" />
            <div className="flex gap-1.5">
              <div className="h-4 w-16 rounded-full bg-muted" />
              <div className="h-4 w-12 rounded-full bg-muted" />
            </div>
          </div>
          <div className="h-7 w-7 rounded-xl bg-muted shrink-0" />
        </div>

        {/* Row 3 stats */}
        <div className="flex gap-1.5">
          <div className="h-10 flex-1 rounded-xl bg-muted" />
          <div className="h-10 flex-1 rounded-xl bg-muted" />
          <div className="h-10 flex-1 rounded-xl bg-muted" />
          <div className="h-10 w-10 rounded-2xl bg-muted shrink-0" />
        </div>

        {/* Row 4 footer */}
        <div className="pt-0.5 border-t border-border/30">
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
