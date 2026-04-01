"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Target, Flame, Loader2, PenLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/social/PostCard";
import { PostComposer } from "@/components/social/PostComposer";
import { getUserPosts } from "@/actions/posts";
import type { IPost, IHabit } from "@/types";

const CATEGORY_GRADIENTS: Record<string, string> = {
  Health: "from-green-400 to-emerald-500",
  Fitness: "from-orange-400 to-red-500",
  Learning: "from-blue-400 to-indigo-500",
  Work: "from-slate-400 to-gray-600",
  Mindfulness: "from-purple-400 to-violet-500",
  Social: "from-pink-400 to-rose-500",
  Finance: "from-yellow-400 to-amber-500",
  Other: "from-violet-400 to-indigo-500",
};

interface ProfileTabsClientProps {
  profileUserId: string;
  viewerUserId: string;
  viewerName: string;
  viewerImage?: string;
  isOwner: boolean;
  publicHabits: IHabit[];
  initialPosts: IPost[];
  initialHasMore: boolean;
}

export function ProfileTabsClient({
  profileUserId,
  viewerUserId,
  viewerName,
  viewerImage,
  isOwner,
  publicHabits,
  initialPosts,
  initialHasMore,
}: ProfileTabsClientProps) {
  const [posts, setPosts] = useState<IPost[]>(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isLoadingMore, startLoadMore] = useTransition();

  function handlePostCreated(post: IPost) {
    setPosts((prev) => [post, ...prev]);
  }

  function handlePostDeleted(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  function handleLoadMore() {
    startLoadMore(async () => {
      const nextPage = page + 1;
      const result = await getUserPosts(
        profileUserId,
        viewerUserId,
        nextPage,
        10
      );
      if (result.data) {
        setPosts((prev) => [...prev, ...result.data!.posts]);
        setHasMore(result.data.hasMore);
        setPage(nextPage);
      }
    });
  }

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full rounded-2xl bg-muted/60 p-1 h-auto gap-1">
        <TabsTrigger
          value="posts"
          className="flex-1 rounded-xl text-xs font-medium py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
        >
          Posts
          {posts.length > 0 && (
            <span className="ml-1.5 rounded-full bg-muted px-1.5 text-[10px] font-bold leading-4">
              {posts.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="habits"
          className="flex-1 rounded-xl text-xs font-medium py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
        >
          Habits
          {publicHabits.length > 0 && (
            <span className="ml-1.5 rounded-full bg-muted px-1.5 text-[10px] font-bold leading-4">
              {publicHabits.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      {/* ── Posts tab ─────────────────────────────────────────────────── */}
      <TabsContent value="posts" className="mt-4 space-y-4">
        {isOwner && viewerName && (
          <PostComposer
            currentUserId={viewerUserId}
            currentUserName={viewerName}
            currentUserImage={viewerImage}
            onPostCreated={handlePostCreated}
            placeholder="Share an update with your followers…"
          />
        )}

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-14 text-center space-y-2">
            <PenLine className="h-8 w-8 text-muted-foreground/30 mx-auto mb-1" />
            <p className="text-sm font-medium text-muted-foreground">
              {isOwner
                ? "You haven't posted anything yet."
                : "No posts yet."}
            </p>
            {isOwner && (
              <p className="text-xs text-muted-foreground">
                Share a streak, achievement, or thought above.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={viewerUserId}
                onDelete={handlePostDeleted}
              />
            ))}
            {hasMore && (
              <div className="flex justify-center pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </TabsContent>

      {/* ── Habits tab ────────────────────────────────────────────────── */}
      <TabsContent value="habits" className="mt-4">
        {publicHabits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center space-y-2">
            <Target className="mx-auto h-8 w-8 text-muted-foreground/40 mb-1" />
            <p className="text-sm text-muted-foreground">
              {isOwner
                ? "No public habits yet. Make a habit public to share it here."
                : "This user hasn't shared any public habits yet."}
            </p>
            {isOwner && (
              <Link
                href="/habits"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline"
              >
                Go to Habits →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {publicHabits.map((habit) => {
                const gradient =
                  CATEGORY_GRADIENTS[habit.category] ??
                  CATEGORY_GRADIENTS.Other;
                return (
                  <div
                    key={habit.id}
                    className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm group-hover:scale-105 transition-transform`}
                      >
                        <Flame className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm leading-tight truncate">
                          {habit.title}
                        </p>
                        {habit.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {habit.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0 rounded-full"
                          >
                            {habit.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">
                            {habit.frequencyType}
                          </span>
                          {habit.adoptionCount > 0 && (
                            <span className="ml-auto text-xs text-violet-500 font-medium">
                              {habit.adoptionCount} adopted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {isOwner && (
              <div className="flex justify-center pt-1">
                <Link
                  href="/habits"
                  className="text-xs text-violet-600 hover:underline"
                >
                  Manage your habits →
                </Link>
              </div>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
