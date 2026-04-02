import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getAllPublicUsers, getPublicHabits, searchUsers } from "@/actions/social";
import { ExploreClient } from "./ExploreClient";

export const metadata = { title: "Explore · Habi2ual" };

interface Props {
  searchParams: { q?: string; tab?: string };
}

export default async function ExplorePage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const query = searchParams.q?.trim() ?? "";
  const tab   = searchParams.tab === "habits" ? "habits" : "people";

  // Parallel data fetch depending on query
  let usersData: Awaited<ReturnType<typeof getAllPublicUsers>>["data"] = { users: [], total: 0 };
  let habitsData: Awaited<ReturnType<typeof getPublicHabits>>["data"] = { habits: [], total: 0 };

  if (query.length >= 2) {
    // Search mode
    const searchResult = await searchUsers(query, userId, 30);
    const users = (searchResult.data ?? []).map((u) => ({ ...u, isFollowing: false }));
    usersData = { users, total: users.length };
    habitsData = (await getPublicHabits(userId, 1, 30)).data ?? { habits: [], total: 0 };
  } else {
    // Browse mode
    [usersData, habitsData] = await Promise.all([
      getAllPublicUsers(userId, 1, 24).then((r) => r.data ?? { users: [], total: 0 }),
      getPublicHabits(userId, 1, 24).then((r) => r.data ?? { habits: [], total: 0 }),
    ]);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 page-container">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Compass className="h-6 w-6 text-violet-500" />
          Explore
        </h1>
        <p className="text-muted-foreground text-sm">
          Discover public users and trending habits
        </p>
      </div>

      <ExploreClient
        currentUserId={userId}
        initialUsers={usersData.users}
        usersTotal={usersData.total}
        initialHabits={habitsData.habits}
        habitsTotal={habitsData.total}
        initialQuery={query}
        initialTab={tab}
      />
    </div>
  );
}
