"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Flame } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface StreakCardModalProps {
    streak: number;
    username: string;
}

export function StreakCardModal({ streak, username }: StreakCardModalProps) {
    const { toast } = useToast();

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "My Habit Streak",
                    text: `I'm on a ${streak}-day streak on Habi2ual! Beat that. 🔥 @${username}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.error("Error sharing", err);
            }
        } else {
            navigator.clipboard.writeText(`I'm on a ${streak}-day streak on Habi2ual! Beat that. 🔥 @${username}`);
            toast({ title: "Copied!", description: "Streak info copied to clipboard." });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" /> Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-violet-900 to-indigo-950 text-white border-0">
                <DialogHeader>
                    <DialogTitle className="text-white text-center">Share Your Progress</DialogTitle>
                </DialogHeader>

                <div id="streak-card" className="relative mt-4 flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/30 blur-3xl rounded-full -translate-x-10 translate-y-10" />

                    <Flame className="w-20 h-20 text-orange-400 drop-shadow-lg mb-4" />
                    <h2 className="text-6xl font-black mb-2 drop-shadow-sm tracking-tight">{streak}</h2>
                    <p className="text-xl font-medium text-white/90 uppercase tracking-widest">Day Streak</p>

                    <div className="mt-8 pt-4 border-t border-white/20 w-full text-center">
                        <p className="text-sm text-white/70 font-medium tracking-wide">@{" "}{username} • Habi2ual</p>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    <Button onClick={handleShare} className="bg-white text-indigo-950 hover:bg-white/90 font-bold w-full rounded-xl">
                        Copy & Share
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
