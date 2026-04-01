"use server";

import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import GroupMember from "@/models/GroupMember";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createGroup(name: string, description: string) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const group = await Group.create({
        name,
        description,
        ownerId: session.user.id,
    });

    await GroupMember.create({
        groupId: group._id,
        userId: session.user.id,
        role: "admin",
    });

    revalidatePath("/groups");
    return { success: true, groupId: group._id.toString() };
}

export async function getGroups() {
    await connectDB();
    const groups = await Group.find({ isPublic: true })
        .sort({ memberCount: -1 })
        .limit(20)
        .lean();

    return groups.map((g: any) => ({ ...g, _id: g._id.toString() }));
}

export async function joinGroup(groupId: string) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const existing = await GroupMember.findOne({ groupId, userId: session.user.id });
    if (existing) return { success: true, alreadyJoined: true };

    await GroupMember.create({
        groupId,
        userId: session.user.id,
        role: "member",
    });

    await Group.findByIdAndUpdate(groupId, { $inc: { memberCount: 1 } });

    revalidatePath("/groups");
    return { success: true };
}
