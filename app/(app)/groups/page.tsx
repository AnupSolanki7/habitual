import { getGroups } from "@/actions/groups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const metadata = {
    title: "Groups | Habi2ual",
};

export default async function GroupsPage() {
    const groups = await getGroups();

    return (
        <div className="container max-w-4xl py-6 mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
                    <p className="text-muted-foreground mt-1">Join groups to build habits together.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-muted/30 border border-dashed rounded-xl">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-semibold mb-2">No groups yet</h2>
                        <p className="text-muted-foreground">Be the first to create a community!</p>
                    </div>
                ) : (
                    groups.map((group: any) => (
                        <Card key={group._id} className="shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{group.name}</CardTitle>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {group.description || "No description provided."}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-sm font-medium bg-muted px-2 py-1 rounded-md">
                                        {group.memberCount} members
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
