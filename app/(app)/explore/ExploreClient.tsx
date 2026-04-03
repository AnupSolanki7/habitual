"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  X,
  Users,
  Target,
  Loader2,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCard } from "@/components/social/UserCard";
import { PublicHabitCard } from "@/components/explore/PublicHabitCard";
import { getAllPublicUsers, getPublicHabits } from "@/actions/social";
import { HABIT_CATEGORIES } from "@/constants";
import type { IUserPublic, IHabit } from "@/types";

type UserWithFollow = IUserPublic & { isFollowing: boolean };
type HabitWithCreator = IHabit & { creator: IUserPublic };

interface Props {
  currentUserId: string;
  initialUsers: UserWithFollow[];
  usersTotal: number;
  initialHabits: HabitWithCreator[];
  habitsTotal: number;
  initialQuery: string;
  initialTab: "people" | "habits";
}

const SORT_OPTIONS = [
  { value: "newest",  label: "Newest" },
  { value: "popular", label: "Most adopted" },
] as const;

export function ExploreClient({
  currentUserId,
  initialUsers,
  usersTotal,
  initialHabits,
  habitsTotal,
  initialQuery,
  initialTab,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<"people" | "habits">(initialTab);
  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<"newest" | "popular">("newest");

  const [users, setUsers] = useState<UserWithFollow[]>(initialUsers);
  const [habits, setHabits] = useState<HabitWithCreator[]>(initialHabits);
  const [totalUsers, setTotalUsers] = useState(usersTotal);
  const [totalHabits, setTotalHabits] = useState(habitsTotal);

  // Push URL params without full reload
  function pushParams(q: string, t: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (t !== "people") params.set("tab", t);
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`);
  }

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      pushParams(value, tab);
    },
    [tab]
  );

  const handleTabChange = (value: string) => {
    const t = value as "people" | "habits";
    setTab(t);
    pushParams(query, t);
  };

  async function handleHabitFilter(newCategory: string, newSort: "newest" | "popular") {
    setCategory(newCategory);
    setSort(newSort);
    startTransition(async () => {
      const result = await getPublicHabits(
        currentUserId,
        1,
        24,
        newCategory || undefined,
        newSort
      );
      if (result.data) {
        setHabits(result.data.habits as HabitWithCreator[]);
        setTotalHabits(result.data.total);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        {isPending ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          className="pl-9 pr-9 rounded-xl h-11 bg-card shadow-sm border-border/60"
          placeholder="Search people by name or @username…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
        {query && (
          <button
            onClick={() => handleQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="w-full rounded-xl h-9">
          <TabsTrigger value="people" className="flex-1 gap-1.5 rounded-lg text-xs">
            <Users className="h-3.5 w-3.5" />
            People
            {totalUsers > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {totalUsers}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex-1 gap-1.5 rounded-lg text-xs">
            <Target className="h-3.5 w-3.5" />
            Habits
            {totalHabits > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {totalHabits}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── People tab ─────────────────────────────────────────────── */}
        <TabsContent value="people" className="mt-4">
          {users.length === 0 ? (
            <EmptyState
              icon={<Users className="h-10 w-10 text-muted-foreground/30" />}
              title={query ? `No users found for "${query}"` : "No public users yet"}
              subtitle={
                query
                  ? "Try a different search term."
                  : "Be the first to set up a public profile!"
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  initialIsFollowing={user.isFollowing}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Habits tab ─────────────────────────────────────────────── */}
        <TabsContent value="habits" className="mt-4">
          {/* Habit filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {/* Category filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-xl gap-1.5 text-xs">
                  <Filter className="h-3.5 w-3.5" />
                  {category || "All categories"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl">
                <DropdownMenuItem
                  onClick={() => handleHabitFilter("", sort)}
                  className={`text-xs rounded-lg cursor-pointer ${!category ? "font-semibold" : ""}`}
                >
                  All categories
                </DropdownMenuItem>
                {HABIT_CATEGORIES.map((c) => (
                  <DropdownMenuItem
                    key={c.value}
                    onClick={() => handleHabitFilter(c.value, sort)}
                    className={`text-xs rounded-lg cursor-pointer ${category === c.value ? "font-semibold" : ""}`}
                  >
                    {c.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-xl gap-1.5 text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {SORT_OPTIONS.find((s) => s.value === sort)?.label ?? "Newest"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl">
                {SORT_OPTIONS.map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onClick={() => handleHabitFilter(category, s.value)}
                    className={`text-xs rounded-lg cursor-pointer ${sort === s.value ? "font-semibold" : ""}`}
                  >
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(category || sort !== "newest") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl gap-1.5 text-xs text-muted-foreground"
                onClick={() => handleHabitFilter("", "newest")}
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          {habits.length === 0 ? (
            <EmptyState
              icon={<Target className="h-10 w-10 text-muted-foreground/30" />}
              title="No public habits yet"
              subtitle="Make your habits public to share them here."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {habits.map((habit) => (
                <PublicHabitCard
                  key={habit.id}
                  habit={habit}
                  currentUserId={currentUserId}
                  isAdoptedByCurrentUser={(habit as any).isAdoptedByCurrentUser ?? false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 py-14 text-center space-y-3">
      <div className="flex justify-center">{icon}</div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{subtitle}</p>
      </div>
    </div>
  );
}
