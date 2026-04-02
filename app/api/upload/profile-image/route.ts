import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  // ── Parse multipart form ──────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // ── Validate type ─────────────────────────────────────────────────
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
      { status: 400 }
    );
  }

  // ── Validate size ─────────────────────────────────────────────────
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5 MB" },
      { status: 400 }
    );
  }

  // ── Upload to Cloudinary ──────────────────────────────────────────
  let secureUrl: string;
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "Habi2ual/avatars",
          public_id: userId,      // one avatar per user; overwrites on re-upload
          overwrite: true,
          invalidate: true,       // bust CDN cache
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed"));
          } else {
            resolve(result as { secure_url: string });
          }
        }
      );
      uploadStream.end(buffer);
    });

    secureUrl = result.secure_url;
  } catch (err) {
    console.error("[POST /api/upload/profile-image] Cloudinary error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  // ── Persist URL to MongoDB ────────────────────────────────────────
  try {
    await connectDB();
    await User.findByIdAndUpdate(userId, { image: secureUrl });
  } catch (err) {
    console.error("[POST /api/upload/profile-image] DB error:", err);
    // Image uploaded successfully but DB save failed — still return the URL
    // so the client can retry saving the profile separately.
    return NextResponse.json(
      { error: "Image uploaded but profile save failed. Please save again.", url: secureUrl },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: secureUrl });
}
