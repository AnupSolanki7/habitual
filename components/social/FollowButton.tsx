"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  /** Called after a successful follow/unfollow so the parent can update counts */
  onToggle?: (nowFollowing: boolean) => void;
  className?: string;
  size?: "sm" | "default" | "lg";
  /** Compact pill style for use in sidebars / cards */
  compact?: boolean;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  onToggle,
  className,
  size = "sm",
  compact = false,
}: FollowButtonProps) {
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();
  const [isHovered, setIsHovered] = useState(false);

  function handleToggle() {
    const nextState = !isFollowing;

    startTransition(async () => {
      try {
        const method = isFollowing ? "DELETE" : "POST";
        const res = await fetch("/api/follow", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: targetUserId }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error ?? "Something went wrong.",
          });
          return;
        }

        setIsFollowing(nextState);
        onToggle?.(nextState);

        toast({
          title: nextState ? "Following" : "Unfollowed",
          description: nextState
            ? "You are now following this user."
            : "You have unfollowed this user.",
        });
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Network error. Please try again.",
        });
      }
    });
  }

  const showUnfollow = isFollowing && isHovered;

  return (
    <Button
      size={size}
      variant={isFollowing ? "outline" : "default"}
      onClick={handleToggle}
      disabled={isPending}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "gap-1.5 transition-all rounded-full",
        compact ? "h-7 px-3 text-xs min-w-0" : "min-w-[100px]",
        isFollowing && !showUnfollow && "border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-300",
        showUnfollow && "border-destructive/50 text-destructive hover:bg-destructive/5",
        !isFollowing && "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 border-0",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : showUnfollow ? (
        <>
          <UserPlus className="h-3.5 w-3.5" />
          Unfollow
        </>
      ) : isFollowing ? (
        <>
          <UserCheck className="h-3.5 w-3.5" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" />
          Follow
        </>
      )}
    </Button>
  );
}
