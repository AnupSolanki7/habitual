import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPublicProfile } from "@/actions/social";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const viewerUserId = (session?.user as { id?: string })?.id;

    const result = await getPublicProfile(params.username, viewerUserId);

    if (result.error) {
      const status = result.error === "User not found." ? 404 : 403;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error("[GET /api/users/[username]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
