"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/actions/notifications";
import type { INotification } from "@/types";

export function useNotifications() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(userId),
        getUnreadCount(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await markAsRead(userId!, id);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllAsRead(userId!);
  }

  async function handleDelete(id: string) {
    const notif = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.read) setUnreadCount((c) => Math.max(0, c - 1));
    await deleteNotification(userId!, id);
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    deleteNotif: handleDelete,
    refetch: load,
  };
}
