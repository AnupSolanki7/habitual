"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    startTransition(() => {
      markAsRead(userId, id);
    });
  }

  function handleDelete(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    startTransition(async () => {
      await deleteNotification(userId, id);
    });
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    startTransition(() => {
      markAllAsRead(userId).then(() => {
        toast({ title: "All notifications marked as read" });
      });
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-16">
        <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">No notifications yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Reminders will appear here when you have pending habits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
          >
            Mark all as read
          </Button>
        </div>
      )}
      <Card className="divide-y overflow-hidden p-0">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
          />
        ))}
      </Card>
    </div>
  );
}
