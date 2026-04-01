import { getLeaderboard } from "@/actions/leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, Trophy, Medal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export async function LeaderboardWidget({ scope = "friends" }: { scope?: "friends" | "global" }) {
    const users = await getLeaderboard(scope);

    if (!users || users.length === 0) return null;

    return (
        <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <CardTitle className="text-lg">Consistency Leaders</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-4 p-0">
                <div className="divide-y divide-border/40">
                    {users.map((user: any) => (
                        <div
                            key={user._id}
                            className={cn(
                                "flex items-center justify-between p-4 transition-colors",
                                user.isSelf ? "bg-muted/50" : "hover:bg-muted/20"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-6 text-center font-bold text-muted-foreground text-sm">
                                    {user.rank === 1 ? <Medal className="w-5 h-5 text-yellow-500 mx-auto" />
                                        : user.rank === 2 ? <Medal className="w-5 h-5 text-slate-400 mx-auto" />
                                            : user.rank === 3 ? <Medal className="w-5 h-5 text-amber-700 mx-auto" />
                                                : user.rank}
                                </div>
                                <Link href={`/u/${user.username}`}>
                                    <Avatar className="w-8 h-8 border shadow-sm">
                                        <AvatarImage src={user.image} />
                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                                            {user.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className="flex flex-col">
                                    <Link href={`/u/${user.username}`} className="text-sm font-semibold hover:underline leading-none">
                                        {user.name}
                                    </Link>
                                    <span className="text-xs text-muted-foreground mt-1">@{user.username}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-orange-600 dark:text-orange-500">
                                {user.longestStreak}
                                <Flame className="w-4 h-4 fill-current" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
