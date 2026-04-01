import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Flame, Trophy, Type, Target, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { IPost } from "@/types";

interface FeedPreviewProps {
  posts: IPost[];
}

const TYPE_ICON = {
  text:        { icon: Type,   color: "text-blue-400" },
  streak:      { icon: Flame,  color: "text-orange-500" },
  achievement: { icon: Trophy, color: "text-yellow-500" },
  habit_share: { icon: Target, color: "text-violet-500" },
};

export function FeedPreview({ posts }: FeedPreviewProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 py-8 text-center space-y-2">
        <p className="text-sm text-muted-foreground">No social updates yet.</p>
        <Link href="/explore" className="text-xs text-violet-600 hover:underline">
          Follow people to see their posts →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => {
        const meta = TYPE_ICON[post.type] ?? TYPE_ICON.text;
        return (
          <div
            key={post.id}
            className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-card p-3 hover:shadow-sm transition-shadow"
          >
            <Link
              href={post.author?.username ? `/u/${post.author.username}` : "#"}
              className="shrink-0"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author?.image ?? ""} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-[10px] font-bold">
                  {getInitials(post.author?.name ?? "U")}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <meta.icon className={`h-3 w-3 ${meta.color} shrink-0`} />
                <span className="text-xs font-semibold truncate">
                  {post.author?.name ?? "User"}
                </span>
                {post.type === "streak" && post.streakCount && (
                  <span className="text-xs text-orange-500 font-bold shrink-0">
                    🔥 {post.streakCount}d
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {post.content}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground/70">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
                {post.commentsCount > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
                    <MessageCircle className="h-2.5 w-2.5" />
                    {post.commentsCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <Link
        href="/social"
        className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
      >
        View full feed
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
