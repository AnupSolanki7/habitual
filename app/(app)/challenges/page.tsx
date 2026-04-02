import { getChallenges } from "@/actions/challenges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export const metadata = {
    title: "Challenges | Habi2ual",
};

export default async function ChallengesPage() {
    const challenges = await getChallenges();

    return (
        <div className="container max-w-4xl py-6 mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
                    <p className="text-muted-foreground mt-1">Push your limits with time-boxed goals.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {challenges.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-muted/30 border border-dashed rounded-xl">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-semibold mb-2">No active challenges</h2>
                        <p className="text-muted-foreground">Check back later for new ones!</p>
                    </div>
                ) : (
                    challenges.map((challenge: any) => (
                        <Card key={challenge._id} className="shadow-sm border-l-4 border-l-indigo-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {challenge.description}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-sm font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-md">
                                        {challenge.durationDays} Days
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {challenge.participantCount} joined
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
