import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { NotificationsClient } from "./NotificationsClient";
import { getNotifications } from "@/actions/notifications";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const notifications = await getNotifications(userId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground text-sm">Your reminders and activity alerts</p>
      </div>
      <NotificationsClient userId={userId} initialNotifications={notifications} />
    </div>
  );
}
