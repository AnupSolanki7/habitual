import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PATCH(req: NextRequest) {
  try {
    const { userId, name } = await req.json();
    if (!userId || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await connectDB();
    await User.findByIdAndUpdate(userId, { name: name.trim() });
    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
