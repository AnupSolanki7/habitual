"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Users, Download, CheckCircle2, Loader2, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { getInitials, cn } from "@/lib/utils";
import { adoptHabit } from "@/actions/posts";
import type { IHabit, IUserPublic } from "@/types";

interface PublicHabitCardProps {
  habit: IHabit & { creator: IUserPublic };
  currentUserId: string;
  /** true if this habit was already adopted / owned by the viewer */
  isOwned?: boolean;
}

const CATEGORY_GRADIENT: Record<string, string> = {
  Health:       "from-green-400 to-emerald-500",
  Fitness:      "from-orange-400 to-red-500",
  Learning:     "from-blue-400 to-indigo-500",
  Work:         "from-slate-400 to-gray-600",
  Mindfulness:  "from-purple-400 to-violet-500",
  Social:       "from-pink-400 to-rose-500",
  Finance:      "from-yellow-400 to-amber-500",
  Other:        "from-violet-400 to-indigo-500",
};

export function PublicHabitCard({ habit, currentUserId, isOwned = false }: PublicHabitCardProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [adopted, setAdopted] = useState(isOwned);
  const [adoptionCount, setAdoptionCount] = useState(habit.adoptionCount);

  const gradient = CATEGORY_GRADIENT[habit.category] ?? CATEGORY_GRADIENT.Other;
  const isOwner = habit.userId === currentUserId;

  function handleAdopt() {
    if (adopted || isOwner) return;
    startTransition(async () => {
      const result = await adoptHabit(currentUserId, habit.id);
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        return;
      }
      setAdopted(true);
      setAdoptionCount((c) => c + 1);
      toast({
        title: "Habit added!",
        description: `"${habit.title}" has been added to your habits.`,
      });
    });
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}
          >
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate">{habit.title}</h3>
            {habit.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <Badge variant="secondary" className="text-xs px-2 py-0 rounded-full">
            {habit.category}
          </Badge>
          <span className="text-xs text-muted-foreground capitalize">{habit.frequencyType}</span>
          {adoptionCount > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-violet-500 font-medium ml-auto">
              <Download className="h-3 w-3" />
              {adoptionCount}
            </span>
          )}
        </div>

        {/* Creator row */}
        <div className="flex items-center justify-between">
          <Link
            href={habit.creator.username ? `/u/${habit.creator.username}` : "#"}
            className="flex items-center gap-1.5 group"
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={habit.creator.image ?? ""} />
              <AvatarFallback className="text-[8px] bg-gradient-to-br from-violet-400 to-indigo-400 text-white font-bold">
                {getInitials(habit.creator.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[100px]">
              {habit.creator.username ? `@${habit.creator.username}` : habit.creator.name}
            </span>
          </Link>

          {isOwner ? (
            <Badge variant="outline" className="text-xs rounded-xl">
              Your habit
            </Badge>
          ) : adopted ? (
            <Badge className="gap-1 text-xs rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
              <CheckCircle2 className="h-3 w-3" />
              Added
            </Badge>
          ) : (
            <Button
              size="sm"
              className="h-7 px-3 text-xs rounded-xl btn-gradient"
              onClick={handleAdopt}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Download className="h-3 w-3 mr-1" />
                  Add habit
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
