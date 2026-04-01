import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { NewHabitClient } from "@/components/habits/NewHabitClient";

export const metadata = { title: "New Habit · HabitFlow" };

export default async function NewHabitPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  return (
    <div className="max-w-2xl mx-auto space-y-5 page-container">
      <NewHabitClient userId={userId} />
    </div>
  );
}
