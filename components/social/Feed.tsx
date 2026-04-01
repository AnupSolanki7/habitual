import { PostCard } from "./PostCard";

interface FeedProps {
    posts: any[];
    currentUserId: string;
}

export function Feed({ posts, currentUserId }: FeedProps) {
    if (!posts || posts.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/30 border border-dashed rounded-xl">
                <p className="text-muted-foreground pb-2 text-lg">Your feed is quiet right now.</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Follow friends to see their habit completions, streaks, and achievements here!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <PostCard key={post._id} post={post} currentUserId={currentUserId} />
            ))}
        </div>
    );
}
