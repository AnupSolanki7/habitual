"use client";

import { useState, useTransition } from "react";
import { Check, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logHabit } from "@/actions/habitLogs";
import { useToast } from "@/components/ui/use-toast";
import type { HabitWithStats } from "@/types";

interface HabitLogButtonProps {
  habit: HabitWithStats;
  userId: string;
  onSuccess?: () => void;
}

export function HabitLogButton({ habit, userId, onSuccess }: HabitLogButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(habit.todayLog?.value ?? 0);
  const { toast } = useToast();

  const isCompleted = habit.isCompletedToday;

  function handleBooleanLog() {
    startTransition(async () => {
      const result = await logHabit(userId, habit.id, {
        completed: !isCompleted,
        value: !isCompleted ? 1 : 0,
      });
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        onSuccess?.();
      }
    });
  }

  function handleValueLog(newValue: number) {
    const clamped = Math.max(0, newValue);
    setValue(clamped);
    startTransition(async () => {
      const result = await logHabit(userId, habit.id, {
        completed: clamped >= habit.targetValue,
        value: clamped,
      });
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        onSuccess?.();
      }
    });
  }

  if (habit.targetType === "boolean") {
    return (
      <button
        onClick={handleBooleanLog}
        disabled={isPending}
        className={cn(
          "h-10 w-10 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-200",
          isPending && "opacity-60 cursor-not-allowed",
          isCompleted
            ? "bg-gradient-to-br from-emerald-400 to-green-500 border-transparent shadow-md shadow-emerald-500/30"
            : "border-white/40 bg-white/10 hover:border-white/70 hover:bg-white/20 active:scale-95"
        )}
        aria-label={isCompleted ? "Mark as not done" : "Mark as done"}
      >
        {isCompleted ? (
          <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
        ) : (
          <div className="h-3.5 w-3.5 rounded-full border-2 border-white/60" />
        )}
      </button>
    );
  }

  // Count / duration type
  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 rounded-full bg-white/15 text-white hover:bg-white/25 border-0"
        onClick={() => handleValueLog(value - 1)}
        disabled={isPending}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="text-sm font-semibold text-white min-w-[44px] text-center">
        {value}/{habit.targetValue}
        {habit.targetType === "duration" ? "m" : ""}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-8 w-8 rounded-full border-0",
          isCompleted
            ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white hover:opacity-90"
            : "bg-white/15 text-white hover:bg-white/25"
        )}
        onClick={() => handleValueLog(value + 1)}
        disabled={isPending}
      >
        {isCompleted ? (
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
