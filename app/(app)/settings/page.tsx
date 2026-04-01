import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SettingsClient } from "./SettingsClient";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const metadata = { title: "Settings · HabitFlow" };

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  await connectDB();

  const user = await User.findById(userId)
    .select("name email username bio image isPublic")
    .lean();

  if (!user) redirect("/login");

  const u = user as {
    name: string;
    email: string;
    username?: string;
    bio?: string;
    image?: string;
    isPublic?: boolean;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-container">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account and public profile
        </p>
      </div>
      <SettingsClient
        userId={userId}
        initialName={u.name}
        initialEmail={u.email}
        initialUsername={u.username ?? ""}
        initialBio={u.bio ?? ""}
        initialImage={u.image ?? ""}
        initialIsPublic={u.isPublic ?? true}
      />
    </div>
  );
}
