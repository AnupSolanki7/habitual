"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, PartyPopper, Flame, Check } from "lucide-react";
import { HabitLogButton } from "@/components/habits/HabitLogButton";
import { getCategoryIcon } from "@/constants/habitIcons";
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
      <section className="habits-section rounded-3xl px-5 pt-5 pb-6">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <p className="font-semibold text-white mb-1">No habits due today</p>
          <p className="text-sm text-white/70 mb-5">
            Create your first habit to start tracking your progress.
          </p>
          <Link
            href="/habits/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-md transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create habit
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="habits-section rounded-3xl px-5 pt-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-base">Today&apos;s Habits</h2>
        <span className="text-xs text-white/70 font-medium bg-white/15 rounded-full px-2.5 py-0.5">
          {completedCount}/{habits.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-white transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* All done banner */}
      {allDone && (
        <div className="flex items-center gap-2 rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-3 mb-3">
          <PartyPopper className="h-4 w-4 text-yellow-300 shrink-0" />
          <p className="text-sm font-semibold text-white">
            All habits done for today!
          </p>
        </div>
      )}

      {/* Habit cards */}
      <div className="space-y-2.5">
        {habits.map((habit) => {
          const HabitIcon = getCategoryIcon(habit.category);
          return (
          <div
            key={habit.id}
            className={
              habit.isCompletedToday ? "habit-glass-card-done" : "habit-glass-card"
            }
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              {/* Category icon badge */}
              <div
                className="h-10 w-10 rounded-2xl shrink-0 flex items-center justify-center"
                style={{
                  backgroundColor: habit.isCompletedToday
                    ? "rgba(255,255,255,0.07)"
                    : habit.color + "33",
                }}
              >
                {habit.isCompletedToday ? (
                  <Check className="h-4 w-4 text-white/50" strokeWidth={2.5} />
                ) : (
                  <HabitIcon className="h-5 w-5" style={{ color: habit.color }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold truncate ${
                    habit.isCompletedToday
                      ? "text-white/40 line-through"
                      : "text-white"
                  }`}
                >
                  {habit.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {habit.currentStreak > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-orange-300 font-medium">
                      <Flame className="h-3 w-3" />
                      {habit.currentStreak}d
                    </span>
                  )}
                  <span className="text-xs text-white/50 capitalize">
                    {habit.category}
                  </span>
                </div>
              </div>

              {/* Log button */}
              <HabitLogButton
                habit={habit}
                userId={userId}
                onSuccess={() => router.refresh()}
              />
            </div>
          </div>
          );
        })}
      </div>

      {/* View all */}
      <div className="mt-3">
        <Link
          href="/habits"
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-2.5 text-sm font-medium text-white/80 hover:bg-white/15 transition-colors"
        >
          View all habits
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

export function TodayHabitsSkeleton() {
  return (
    <section className="habits-section rounded-3xl px-5 pt-5 pb-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-36 rounded bg-white/20" />
        <div className="h-5 w-12 rounded-full bg-white/20" />
      </div>
      <div className="mb-4 h-1.5 w-full rounded-full bg-white/20" />
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="habit-glass-card">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="h-10 w-10 rounded-2xl bg-white/10 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 rounded bg-white/10" />
                <div className="h-3 w-20 rounded bg-white/10" />
              </div>
              <div className="h-10 w-10 rounded-full bg-white/10 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
