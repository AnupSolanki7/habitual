import { getProfileByUsername } from "@/actions/profile";
import { ProfileHeader } from "@/components/social/ProfileHeader";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface ProfilePageProps {
    params: { username: string };
}

export async function generateMetadata({ params: { username } }: ProfilePageProps): Promise<Metadata> {
    const profile = await getProfileByUsername(username);
    if (!profile) return { title: "User Not Found" };

    return {
        title: `${profile.name} (@${profile.username}) | HabitFlow`,
        description: profile.bio || `View ${profile.name}'s habit streaks and progress.`,
    };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const profile = await getProfileByUsername(params.username);

    if (!profile) {
        notFound();
    }

    return (
        <div className="container max-w-4xl py-6 mx-auto">
            <ProfileHeader profile={profile} />

            <div className="grid gap-6 md:grid-cols-3 mt-8">
                <div className="md:col-span-2 space-y-6">
                    {/* Feed logic will go here in the next phase */}
                    <div className="bg-muted/30 border border-dashed rounded-xl p-12 text-center">
                        <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
                        <p className="text-muted-foreground">
                            {profile.isSelf
                                ? "Your recent habit completions and streaks will appear here."
                                : `${profile.name}'s activity will appear here once they complete habits.`}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Public habits / widgets */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold mb-4">About</h3>
                        {profile.isPublic ? (
                            <p className="text-sm text-muted-foreground text-center">
                                User's public habits will be visible here.
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center">
                                This account's detailed habits are private.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
