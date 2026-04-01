"use client";

import { useState, useTransition } from "react";
import { Rss, Users, Loader2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostComposer } from "@/components/social/PostComposer";
import { PostCard } from "@/components/social/PostCard";
import { getFeedPosts } from "@/actions/posts";
import type { IPost } from "@/types";

interface Props {
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string;
  initialPosts: IPost[];
  initialHasMore: boolean;
}

export function SocialFeedClient({
  currentUserId,
  currentUserName,
  currentUserImage,
  initialPosts,
  initialHasMore,
}: Props) {
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
      const result = await getFeedPosts(currentUserId, nextPage, 15);
      if (result.data) {
        setPosts((prev) => [...prev, ...result.data!.posts]);
        setHasMore(result.data.hasMore);
        setPage(nextPage);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Composer */}
      <PostComposer
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserImage={currentUserImage}
        onPostCreated={handlePostCreated}
      />

      {/* Feed label */}
      <div className="flex items-center gap-2 pt-1">
        <Rss className="h-4 w-4 text-violet-500 shrink-0" />
        <h2 className="font-semibold text-sm">Your feed</h2>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-14 text-center space-y-3">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <div>
            <p className="font-semibold text-sm">Your feed is empty</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Follow people to see their updates here. You can also create your own post above.
            </p>
          </div>
          <Link href="/explore">
            <Button size="sm" variant="outline" className="rounded-xl gap-1.5 mt-1">
              Discover people
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={handlePostDeleted}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCcw className="h-3.5 w-3.5" />
                )}
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
