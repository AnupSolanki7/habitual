"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getHabits, getHabitWithStats } from "@/actions/habits";
import type { HabitWithStats } from "@/types";

export function useHabits() {
  const sessionData = useSession();

  const session = sessionData?.data;
  const userId = (session?.user as any)?.id as string | undefined;

  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const basicHabits = await getHabits(userId);
      const withStats = await Promise.all(
        basicHabits.map((h) => getHabitWithStats(userId, h.id)),
      );
      setHabits(withStats.filter(Boolean) as HabitWithStats[]);
    } catch (err: any) {
      setError(err.message || "Failed to load habits");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { habits, isLoading, error, refetch: load };
}
