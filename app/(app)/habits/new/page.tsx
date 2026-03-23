import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { HabitForm } from "@/components/habits/HabitForm";

export default async function NewHabitPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Habit</h1>
        <p className="text-muted-foreground text-sm">Create a new habit to track.</p>
      </div>
      <HabitForm userId={userId} />
    </div>
  );
}
