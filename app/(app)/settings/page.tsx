import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SettingsClient } from "./SettingsClient";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  await connectDB();
  const user = await User.findById(userId).lean();

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account preferences</p>
      </div>
      <SettingsClient
        userId={userId}
        initialName={(user as any).name}
        initialEmail={(user as any).email}
        plan={(user as any).plan}
      />
    </div>
  );
}
