"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  Trash2,
  Trophy,
  Target,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  Flame,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { getInitials, cn } from "@/lib/utils";
import {
  toggleReaction,
  addComment,
  deleteComment,
  getPostComments,
  deletePost,
} from "@/actions/posts";
import type { IPost, IComment, ReactionType } from "@/types";

// ─── Config ──────────────────────────────────────────────────────────────────

interface ReactionConfig {
  type: ReactionType;
  emoji: string;
  label: string;
  countKey: keyof IPost;
  activeClass: string;
}

const REACTIONS: ReactionConfig[] = [
  {
    type: "like",
    emoji: "👍",
    label: "Like",
    countKey: "likesCount",
    activeClass:
      "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40",
  },
  {
    type: "fire",
    emoji: "🔥",
    label: "Fire",
    countKey: "fireCount",
    activeClass:
      "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/40",
  },
  {
    type: "clap",
    emoji: "👏",
    label: "Clap",
    countKey: "clapCount",
    activeClass:
      "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40",
  },
];

const TYPE_CONFIG: Record<
  string,
  {
    label: string | null;
    Icon: React.ElementType | null;
    accentGradient: string | null;
    badgeClass: string;
  }
> = {
  text: {
    label: null,
    Icon: null,
    accentGradient: null,
    badgeClass: "",
  },
  streak: {
    label: "Streak Share",
    Icon: Flame,
    accentGradient: "from-orange-500 to-amber-400",
    badgeClass:
      "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/40",
  },
  achievement: {
    label: "Achievement",
    Icon: Trophy,
    accentGradient: "from-yellow-400 to-amber-400",
    badgeClass:
      "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800/40",
  },
  habit_share: {
    label: "Habit Share",
    Icon: Target,
    accentGradient: "from-violet-500 to-indigo-500",
    badgeClass:
      "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/40",
  },
};

// ─── PostCard ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: IPost;
  currentUserId: string;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const { toast } = useToast();

  const [localPost, setLocalPost] = useState(post);
  const [comments, setComments] = useState<IComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const [reactionPending, startReactionTransition] = useTransition();
  const [commentPending, startCommentTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

  const isOwner = localPost.userId === currentUserId;
  const config = TYPE_CONFIG[localPost.type] ?? TYPE_CONFIG.text;

  // ── Reactions ──────────────────────────────────────────────────────────────
  function handleReaction(type: ReactionType) {
    if (reactionPending) return;
    startReactionTransition(async () => {
      const wasActive = localPost.viewerReaction === type;
      const wasOther =
        localPost.viewerReaction && localPost.viewerReaction !== type;

      setLocalPost((prev) => {
        const next = { ...prev };
        if (wasActive) {
          const r = REACTIONS.find((r) => r.type === type)!;
          (next as any)[r.countKey] = Math.max(
            0,
            (prev as any)[r.countKey] - 1
          );
          next.viewerReaction = undefined;
        } else {
          if (wasOther) {
            const old = REACTIONS.find(
              (r) => r.type === prev.viewerReaction
            )!;
            (next as any)[old.countKey] = Math.max(
              0,
              (prev as any)[old.countKey] - 1
            );
          }
          const newR = REACTIONS.find((r) => r.type === type)!;
          (next as any)[newR.countKey] = (prev as any)[newR.countKey] + 1;
          next.viewerReaction = type;
        }
        return next;
      });

      const result = await toggleReaction(currentUserId, localPost.id, type);
      if (result.error) {
        setLocalPost(post);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    });
  }

  // ── Comments ──────────────────────────────────────────────────────────────
  async function handleToggleComments() {
    if (!showComments && !commentsLoaded) {
      const result = await getPostComments(localPost.id);
      if (result.data) {
        setComments(result.data);
        setCommentsLoaded(true);
      }
    }
    setShowComments((v) => !v);
  }

  function handleAddComment() {
    if (!commentText.trim()) return;
    startCommentTransition(async () => {
      const result = await addComment(
        currentUserId,
        localPost.id,
        commentText.trim()
      );
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        return;
      }
      if (result.data) {
        setComments((prev) => [...prev, result.data!]);
        setLocalPost((prev) => ({
          ...prev,
          commentsCount: prev.commentsCount + 1,
        }));
        setCommentText("");
      }
    });
  }

  function handleDeleteComment(commentId: string) {
    startCommentTransition(async () => {
      const result = await deleteComment(currentUserId, commentId);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setLocalPost((prev) => ({
        ...prev,
        commentsCount: Math.max(0, prev.commentsCount - 1),
      }));
    });
  }

  function handleDeletePost() {
    startDeleteTransition(async () => {
      const result = await deletePost(currentUserId, localPost.id);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        return;
      }
      onDelete?.(localPost.id);
      toast({ title: "Post deleted" });
    });
  }

  return (
    <article className="feed-card group animate-fade-in">
      {/* Post-type accent strip */}
      {config.accentGradient && (
        <div
          className={`h-0.5 w-full bg-gradient-to-r ${config.accentGradient}`}
        />
      )}

      <div className="p-4">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href={
                localPost.author?.username
                  ? `/u/${localPost.author.username}`
                  : "#"
              }
              className="shrink-0"
            >
              <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
                <AvatarImage src={localPost.author?.image ?? ""} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xs font-semibold">
                  {getInitials(localPost.author?.name ?? "U")}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={
                    localPost.author?.username
                      ? `/u/${localPost.author.username}`
                      : "#"
                  }
                  className="text-sm font-semibold hover:underline leading-tight"
                >
                  {localPost.author?.name ?? "Unknown"}
                </Link>
                {config.label && config.Icon && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      config.badgeClass
                    )}
                  >
                    <config.Icon className="h-2.5 w-2.5" />
                    {config.label}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                {localPost.author?.username
                  ? `@${localPost.author.username} · `
                  : ""}
                {formatDistanceToNow(new Date(localPost.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={handleDeletePost}
              disabled={deletePending}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 opacity-0 group-hover:opacity-100 transition-all shrink-0"
            >
              {deletePending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* ── Streak banner ───────────────────────────────────────────── */}
        {localPost.type === "streak" && localPost.streakCount && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-400/5 border border-orange-200/60 dark:border-orange-900/30 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-sm shrink-0">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-orange-600 dark:text-orange-400 text-lg leading-tight">
                {localPost.streakCount} day streak!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Consistency is everything 🔥
              </p>
            </div>
          </div>
        )}

        {/* ── Achievement banner ──────────────────────────────────────── */}
        {localPost.type === "achievement" && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-yellow-400/10 to-amber-400/5 border border-yellow-200/60 dark:border-yellow-900/30 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-sm shrink-0">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-yellow-700 dark:text-yellow-400 leading-tight">
                Achievement Unlocked!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Keep building momentum 🏆
              </p>
            </div>
          </div>
        )}

        {/* ── Habit reference ─────────────────────────────────────────── */}
        {localPost.habitRef && (
          <div
            className="mb-3 flex items-center gap-3 rounded-2xl border px-3 py-2.5"
            style={{
              borderColor: localPost.habitRef.color + "40",
              backgroundColor: localPost.habitRef.color + "0d",
            }}
          >
            <div
              className="h-9 w-9 rounded-xl shrink-0 flex items-center justify-center shadow-sm"
              style={{ backgroundColor: localPost.habitRef.color }}
            >
              <Target className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {localPost.habitRef.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {localPost.habitRef.category}
              </p>
            </div>
          </div>
        )}

        {/* ── Content ──────────────────────────────────────────────────── */}
        <p className="text-sm leading-relaxed text-foreground/90 mb-3 whitespace-pre-wrap">
          {localPost.content}
        </p>

        {/* ── Reaction bar ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 pt-2.5 border-t border-border/40">
          {REACTIONS.map(({ type, emoji, label, countKey, activeClass }) => {
            const count = (localPost as any)[countKey] as number;
            const isActive = localPost.viewerReaction === type;
            return (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                disabled={reactionPending}
                title={label}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all border",
                  isActive
                    ? activeClass
                    : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <span className="text-sm leading-none">{emoji}</span>
                {count > 0 && (
                  <span className="tabular-nums leading-none">{count}</span>
                )}
              </button>
            );
          })}

          <button
            onClick={handleToggleComments}
            className={cn(
              "ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all border",
              showComments
                ? "bg-secondary text-foreground border-border/50"
                : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {localPost.commentsCount > 0 && (
              <span className="tabular-nums">{localPost.commentsCount}</span>
            )}
            {showComments ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* ── Comments section ─────────────────────────────────────────── */}
        {showComments && (
          <div className="mt-3 space-y-2 pt-3 border-t border-border/40 animate-slide-up">
            {comments.length === 0 && commentsLoaded && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No comments yet. Be the first!
              </p>
            )}
            {comments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onDelete={handleDeleteComment}
              />
            ))}
            {/* Comment input */}
            <div className="flex gap-2 pt-1 items-center">
              <input
                type="text"
                placeholder="Add a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                disabled={commentPending}
                className="flex-1 h-8 rounded-full border border-input bg-muted/50 px-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || commentPending}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white disabled:opacity-40 hover:opacity-90 transition-opacity shadow-sm"
              >
                {commentPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

// ─── CommentRow ──────────────────────────────────────────────────────────────

function CommentRow({
  comment,
  currentUserId,
  onDelete,
}: {
  comment: IComment;
  currentUserId: string;
  onDelete: (id: string) => void;
}) {
  const isOwner = comment.userId === currentUserId;
  return (
    <div className="flex items-start gap-2 group/comment">
      <Avatar className="h-6 w-6 shrink-0 mt-0.5 ring-1 ring-background shadow-sm">
        <AvatarImage src={comment.author?.image ?? ""} />
        <AvatarFallback className="text-[9px] bg-gradient-to-br from-violet-400 to-indigo-400 text-white">
          {getInitials(comment.author?.name ?? "U")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 rounded-2xl bg-secondary/60 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold leading-tight">
            {comment.author?.name ?? "User"}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-xs text-foreground/80 mt-0.5 leading-relaxed">
          {comment.text}
        </p>
      </div>
      {isOwner && (
        <button
          onClick={() => onDelete(comment.id)}
          className="opacity-0 group-hover/comment:opacity-100 shrink-0 mt-2 text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
