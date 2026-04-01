"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, Search, Archive, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitCard, HabitCardSkeleton } from "@/components/habits/HabitCard";
import { useToast } from "@/components/ui/use-toast";
import { getAllHabits, deleteHabit, archiveHabit, getHabitWithStats } from "@/actions/habits";
import type { HabitWithStats } from "@/types";

export default function HabitsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const userId = (session?.user as any)?.id;

  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<HabitWithStats[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!userId) return;
    loadHabits();
  }, [userId]);

  async function loadHabits() {
    setIsLoading(true);
    try {
      const all = await getAllHabits(userId);
      const withStats = await Promise.all(
        all.map((h) => getHabitWithStats(userId, h.id))
      );
      const valid = withStats.filter(Boolean) as HabitWithStats[];
      setHabits(valid.filter((h) => !h.archived));
      setArchivedHabits(valid.filter((h) => h.archived));
    } finally {
      setIsLoading(false);
    }
  }

  function handleArchive(id: string, archived: boolean) {
    startTransition(async () => {
      const result = await archiveHabit(userId, id, archived);
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        toast({ title: archived ? "Habit archived" : "Habit restored" });
        loadHabits();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this habit and all its logs? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteHabit(userId, id);
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        toast({ title: "Habit deleted" });
        loadHabits();
      }
    });
  }

  const filtered = habits.filter(
    (h) =>
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-4xl mx-auto page-container">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="glass-panel px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">My Habits</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {habits.length} active · {archivedHabits.length} archived
          </p>
        </div>
        <Button
          asChild
          className="btn-gradient rounded-2xl h-10 px-4 text-sm font-semibold shadow-sm"
        >
          <Link href="/habits/new">
            <Plus className="mr-1.5 h-4 w-4" /> New Habit
          </Link>
        </Button>
      </div>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name or category…"
          className="pl-10 h-11 rounded-2xl border-border/60 bg-background/60 backdrop-blur-sm shadow-sm focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <Tabs defaultValue="active">
        <TabsList className="rounded-2xl h-10 p-1">
          <TabsTrigger value="active" className="rounded-xl text-xs font-semibold px-4">
            Active
            <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">
              {habits.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="archived" className="rounded-xl text-xs font-semibold px-4">
            <Archive className="mr-1.5 h-3 w-3" />
            Archived
            <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">
              {archivedHabits.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Active tab */}
        <TabsContent value="active" className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <HabitCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              {search ? (
                <p className="text-muted-foreground">
                  No habits match &quot;{search}&quot;
                </p>
              ) : (
                <div className="space-y-3">
                  <Sparkles className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                  <p className="text-muted-foreground font-medium">No habits yet.</p>
                  <p className="text-sm text-muted-foreground/70">
                    Create your first habit to start building momentum.
                  </p>
                  <Button asChild className="btn-gradient rounded-2xl mt-1">
                    <Link href="/habits/new">Create your first habit</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  userId={userId}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onLog={loadHabits}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Archived tab */}
        <TabsContent value="archived" className="mt-4">
          {archivedHabits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No archived habits.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {archivedHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  userId={userId}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
