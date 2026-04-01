"use client";

import { useState, useTransition } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/actions/notifications";
import { useToast } from "@/components/ui/use-toast";
import type { INotification } from "@/types";

interface NotificationsClientProps {
  userId: string;
  initialNotifications: INotification[];
}

export function NotificationsClient({
  userId,
  initialNotifications,
}: NotificationsClientProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    startTransition(() => markAsRead(userId, id));
  }

  function handleDelete(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    startTransition(() => deleteNotification(userId, id));
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    startTransition(async () => {
      await markAllAsRead(userId);
      toast({ title: "All notifications marked as read" });
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/50 py-20 text-center space-y-3">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Bell className="h-7 w-7 text-muted-foreground/50" />
          </div>
        </div>
        <div>
          <p className="font-semibold text-sm">No notifications yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Activity from your social interactions and habit reminders will
            appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {unreadCount} unread
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="h-7 gap-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden divide-y divide-border/40">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
