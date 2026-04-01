import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "./FollowButton";
import { StreakCardModal } from "./StreakCardModal";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, UserCircle, Flame } from "lucide-react";

interface ProfileHeaderProps {
    profile: {
        _id: string;
        name: string;
        username: string;
        image?: string;
        bio?: string;
        followersCount: number;
        followingCount: number;
        longestStreak: number;
        isFollowing: boolean;
        isSelf: boolean;
    };
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <Card className="mb-6 border-none shadow-sm bg-gradient-to-br from-card to-muted/50">
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
                        <AvatarImage src={profile.image} alt={profile.name} />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
                                <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-1">
                                    <UserCircle className="w-4 h-4" />
                                    @{profile.username}
                                </p>
                            </div>

                            {!profile.isSelf ? (
                                <FollowButton
                                    userId={profile._id}
                                    initialIsFollowing={profile.isFollowing}
                                />
                            ) : (
                                <StreakCardModal streak={profile.longestStreak} username={profile.username} />
                            )}
                        </div>

                        {profile.bio && (
                            <p className="text-sm pt-2 pb-2 max-w-md">{profile.bio}</p>
                        )}

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                            <div className="flex flex-col items-center md:items-start">
                                <span className="font-bold text-lg">{profile.followersCount}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Followers</span>
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <span className="font-bold text-lg">{profile.followingCount}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Following</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 dark:bg-orange-500/10 rounded-full">
                                <Flame className="w-5 h-5 fill-current" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm leading-none">{profile.longestStreak}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 leading-none mt-1">Best Streak</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
