"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, Search, Archive, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { HabitCard } from "@/components/habits/HabitCard";
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

  const filtered = habits.filter((h) =>
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    h.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="text-muted-foreground text-sm">{habits.length} active habits</p>
        </div>
        <Button asChild>
          <Link href="/habits/new">
            <Plus className="mr-2 h-4 w-4" /> New Habit
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search habits..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active <Badge variant="secondary" className="ml-1.5 text-xs">{habits.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="mr-1.5 h-3 w-3" />
            Archived <Badge variant="secondary" className="ml-1.5 text-xs">{archivedHabits.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-secondary rounded w-1/2" />
                      <div className="h-3 bg-secondary rounded w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              {search ? (
                <p className="text-muted-foreground">No habits match &quot;{search}&quot;</p>
              ) : (
                <div className="space-y-3">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                  <p className="text-muted-foreground">No habits yet.</p>
                  <Button asChild>
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
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          {archivedHabits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No archived habits.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {archivedHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  userId={userId}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
