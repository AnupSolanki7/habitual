"use server";

import { connectDB } from "@/lib/db";
import Challenge from "@/models/Challenge";
import ChallengeParticipant from "@/models/ChallengeParticipant";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getChallenges() {
    await connectDB();
    const challenges = await Challenge.find({ isActive: true })
        .sort({ participantCount: -1 })
        .lean();

    return challenges.map((c: any) => ({ ...c, _id: c._id.toString() }));
}

export async function joinChallenge(challengeId: string) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const existing = await ChallengeParticipant.findOne({ challengeId, userId: session.user.id });
    if (existing) return { success: true, alreadyJoined: true };

    await ChallengeParticipant.create({
        challengeId,
        userId: session.user.id,
    });

    await Challenge.findByIdAndUpdate(challengeId, { $inc: { participantCount: 1 } });

    revalidatePath("/challenges");
    return { success: true };
}
