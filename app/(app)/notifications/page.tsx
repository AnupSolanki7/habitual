import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { NotificationsClient } from "./NotificationsClient";
import { getNotifications } from "@/actions/notifications";

export const metadata = { title: "Notifications · HabitFlow" };

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const notifications = await getNotifications(userId, 50);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5 page-container">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm">
          <Bell className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            {unread > 0
              ? `${unread} unread notification${unread === 1 ? "" : "s"}`
              : "All caught up"}
          </p>
        </div>
      </div>

      <NotificationsClient userId={userId} initialNotifications={notifications} />
    </div>
  );
}
