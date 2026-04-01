"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleReaction } from "@/actions/feed";
import { ThumbsUp, Flame, MessageCircle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReactionBarProps {
    postId: string;
    initialLikesCount: number;
    initialUserReaction: string | null;
}

export function ReactionBar({ postId, initialLikesCount, initialUserReaction }: ReactionBarProps) {
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [userReaction, setUserReaction] = useState(initialUserReaction);
    const [isLoading, setIsLoading] = useState(false);

    async function handleReact(type: "like" | "fire" | "clap") {
        if (isLoading) return;
        setIsLoading(true);

        const oldReaction = userReaction;
        const oldLikesCount = likesCount;

        // Optimistic Update
        if (userReaction === type) {
            setUserReaction(null);
            setLikesCount(prev => prev - 1);
        } else {
            if (!userReaction) setLikesCount(prev => prev + 1);
            setUserReaction(type);
        }

        try {
            const res = await toggleReaction(postId, type);
            if (res.action === "removed") {
                setUserReaction(null);
            } else {
                setUserReaction(res.type);
            }
        } catch {
            // Revert on error
            setUserReaction(oldReaction);
            setLikesCount(oldLikesCount);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-1 mt-4 border-t pt-3">
            <Button
                variant="ghost"
                size="sm"
                className={cn("text-muted-foreground gap-1.5 px-3", userReaction === "fire" && "text-orange-500 bg-orange-50 dark:bg-orange-500/10")}
                onClick={() => handleReact("fire")}
                disabled={isLoading}
            >
                <Flame className={cn("w-4 h-4", userReaction === "fire" && "fill-current")} />
                <span className="font-medium">{userReaction === "fire" ? likesCount : (likesCount > 0 ? likesCount : "React")}</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-1.5 px-3"
            >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Comment</span>
            </Button>
        </div>
    );
}
