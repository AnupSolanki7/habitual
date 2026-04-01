"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, Trophy, Info, UserPlus, Heart, MessageCircle, Download, Flame, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { INotification } from "@/types";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; iconColor: string; bgColor: string }
> = {
  reminder: {
    icon: Bell,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  achievement: {
    icon: Trophy,
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  system: {
    icon: Info,
    iconColor: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  new_follower: {
    icon: UserPlus,
    iconColor: "text-violet-500",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
  },
  post_liked: {
    icon: Heart,
    iconColor: "text-rose-500",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
  },
  post_commented: {
    icon: MessageCircle,
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  habit_adopted: {
    icon: Download,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  streak_milestone: {
    icon: Flame,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
};

const DEFAULT_CONFIG = TYPE_CONFIG.system;

interface NotificationItemProps {
  notification: INotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type] ?? DEFAULT_CONFIG;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 transition-colors cursor-pointer",
        !notification.read && "bg-primary/5 dark:bg-primary/10"
      )}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className={cn("mt-0.5 shrink-0 h-8 w-8 rounded-xl flex items-center justify-center", config.bgColor)}>
        <Icon className={cn("h-4 w-4", config.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium leading-tight", !notification.read && "text-foreground")}>
            {notification.title}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notification.read && (
        <div className="mt-2 shrink-0 h-2 w-2 rounded-full bg-primary" />
      )}
    </div>
  );
}
