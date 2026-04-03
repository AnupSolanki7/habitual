"use client";

import Link from "next/link";
import { useState } from "react";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/social/FollowButton";
import { getInitials } from "@/lib/utils";
import { IUserPublic } from "@/types";
import { cn } from "@/lib/utils";

interface UserCardProps {
  user: IUserPublic;
  currentUserId?: string;
  initialIsFollowing?: boolean;
  className?: string;
}

export function UserCard({
  user,
  currentUserId,
  initialIsFollowing = false,
  className,
}: UserCardProps) {
  const [followerDelta, setFollowerDelta] = useState(0);
  const isOwn = currentUserId === user.id;

  function handleToggle(nowFollowing: boolean) {
    setFollowerDelta((prev) => prev + (nowFollowing ? 1 : -1));
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border/50 bg-card px-3 py-2.5 hover:bg-accent/30 transition-colors",
        className
      )}
    >
      <Link
        href={user.username ? `/u/${user.username}` : "#"}
        className="shrink-0"
      >
        <Avatar className="h-9 w-9 ring-2 ring-violet-100 dark:ring-violet-900/40">
          <AvatarImage src={user.image ?? ""} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xs font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={user.username ? `/u/${user.username}` : "#"}
          className="hover:underline underline-offset-2"
        >
          <p className="text-sm font-semibold truncate leading-tight">{user.name}</p>
        </Link>
        <div className="flex items-center gap-1.5 mt-0.5">
          {user.username && (
            <span className="text-xs text-muted-foreground truncate">@{user.username}</span>
          )}
          <span className="text-muted-foreground/40 text-xs">·</span>
          <Users className="h-3 w-3 text-muted-foreground/60 shrink-0" />
          <span className="text-xs text-muted-foreground">
            {(user.followersCount + followerDelta).toLocaleString()}
          </span>
        </div>
      </div>

      {!isOwn && currentUserId && (
        <FollowButton
          targetUserId={user.id}
          initialIsFollowing={initialIsFollowing}
          onToggle={handleToggle}
          size="sm"
          compact
        />
      )}
    </div>
  );
}
