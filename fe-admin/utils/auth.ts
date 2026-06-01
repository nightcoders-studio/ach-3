import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export type JWTPayload = {
  user_id: string;
  role: "customer" | "admin";
};

export function verifyToken(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return payload;
  } catch {
    return null;
  }
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}
