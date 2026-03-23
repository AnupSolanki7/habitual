import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getHabitById } from "@/actions/habits";
import { HabitForm } from "@/components/habits/HabitForm";

interface Props {
  params: { id: string };
}

export default async function EditHabitPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const habit = await getHabitById(userId, params.id);
  if (!habit) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Habit</h1>
        <p className="text-muted-foreground text-sm">Update your habit settings.</p>
      </div>
      <HabitForm userId={userId} habit={habit} />
    </div>
  );
}
