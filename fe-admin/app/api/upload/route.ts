import {
  verifyToken,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  // 1. Verify admin authentication
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "admin") return forbiddenResponse();

  try {
    // 2. Parse file from FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // 3. Parse Cloudinary Credentials from URL env
    const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      return NextResponse.json(
        { error: "Kredensial Cloudinary belum dikonfigurasi" },
        { status: 500 },
      );
    }

    // Format: cloudinary://<api_key>:<api_secret>@<cloud_name>
    const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (!match) {
      return NextResponse.json(
        { error: "Format kredensial Cloudinary tidak valid" },
        { status: 500 },
      );
    }

    const apiKey = match[1];
    const apiSecret = match[2];
    const cloudName = match[3];

    // 4. Generate Cloudinary Signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");

    // 5. Build Multipart Form for Cloudinary Request
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp.toString());
    cloudinaryFormData.append("signature", signature);

    // 6. Post to Cloudinary REST API
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      },
    );

    const cloudinaryData = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
      console.error("Cloudinary error response:", cloudinaryData);
      return NextResponse.json(
        { error: cloudinaryData.error?.message || "Gagal mengunggah ke Cloudinary" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: cloudinaryData.secure_url });
  } catch (error) {
    console.error("Upload API error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server internal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
