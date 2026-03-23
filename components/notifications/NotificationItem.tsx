"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, Trophy, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { INotification } from "@/types";

const typeIcons = {
  reminder: Bell,
  achievement: Trophy,
  system: Info,
};

const typeColors = {
  reminder: "text-blue-500",
  achievement: "text-yellow-500",
  system: "text-gray-500",
};

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
  const Icon = typeIcons[notification.type] ?? Bell;
  const iconColor = typeColors[notification.type] ?? "text-gray-500";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg p-4 transition-colors",
        notification.read
          ? "bg-transparent"
          : "bg-primary/5 border border-primary/20"
      )}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className={cn("mt-0.5 shrink-0", iconColor)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium", !notification.read && "text-foreground")}>
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
        <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notification.read && (
        <div className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-primary" />
      )}
    </div>
  );
}
