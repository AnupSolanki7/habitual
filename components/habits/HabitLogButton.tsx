"use client";

import { useState, useTransition } from "react";
import { Check, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <Button
        size="sm"
        variant={isCompleted ? "default" : "outline"}
        className={cn(
          "min-w-[80px] transition-all",
          isCompleted && "bg-green-600 hover:bg-green-700 text-white border-green-600"
        )}
        onClick={handleBooleanLog}
        disabled={isPending}
      >
        {isCompleted ? (
          <>
            <Check className="h-3 w-3 mr-1" /> Done
          </>
        ) : (
          "Mark Done"
        )}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7"
        onClick={() => handleValueLog(value - 1)}
        disabled={isPending}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="text-sm font-medium min-w-[40px] text-center">
        {value}/{habit.targetValue}
        {habit.targetType === "duration" ? "m" : ""}
      </span>
      <Button
        size="icon"
        variant="outline"
        className={cn(
          "h-7 w-7",
          isCompleted && "bg-green-600 hover:bg-green-700 text-white border-green-600"
        )}
        onClick={() => handleValueLog(value + 1)}
        disabled={isPending}
      >
        {isCompleted ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      </Button>
    </div>
  );
}
