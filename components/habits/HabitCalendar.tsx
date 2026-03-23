"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { IHabitLog } from "@/types";

interface HabitCalendarProps {
  logs: IHabitLog[];
  month?: Date;
}

export function HabitCalendar({ logs, month = new Date() }: HabitCalendarProps) {
  const completedDates = useMemo(
    () => new Set(logs.filter((l) => l.completed).map((l) => l.date)),
    [logs]
  );

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding for start of month
  const startPadding = getDay(monthStart); // 0=Sun

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {/* Padding cells */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isCompleted = completedDates.has(dateStr);
          const today = isToday(day);

          return (
            <div
              key={dateStr}
              title={dateStr}
              className={cn(
                "aspect-square flex items-center justify-center rounded text-xs font-medium transition-colors",
                isCompleted
                  ? "bg-green-500 text-white"
                  : today
                  ? "border-2 border-primary text-primary"
                  : "bg-secondary/50 text-muted-foreground"
              )}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
}
